# Minimal model definition for inference.
# Contains only what's needed to load the trained checkpoint and run predictions:
#   - Input geometry constants
#   - Preprocessing (crop_to_ink, gentle_preprocessing)
#   - Architecture (ColumnPool, build_model)
#
# Training code, evaluation utilities, augmentation, Grad-CAM helpers, and
# audit functions live in the research repo — not needed here.

import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input


# Input geometry. Width is 2x height to match handwriting line aspect ratio.
INPUT_H = 224
INPUT_W = 448
INPUT_SHAPE = (INPUT_H, INPUT_W, 3)


# -----------------------------------------------------------------------------
# Preprocessing
# -----------------------------------------------------------------------------

def crop_to_ink(img_uint8_gray, padding=20):
    """Crop grayscale image to the ink bounding box, with padding."""
    _, mask = cv2.threshold(
        img_uint8_gray, 0, 255,
        cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU,
    )
    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

    coords = cv2.findNonZero(mask)
    if coords is None:
        return img_uint8_gray

    x, y, w, h = cv2.boundingRect(coords)
    if w * h < 0.02 * img_uint8_gray.size:
        return img_uint8_gray

    H, W = img_uint8_gray.shape
    x0 = max(0, x - padding)
    y0 = max(0, y - padding)
    x1 = min(W, x + w + padding)
    y1 = min(H, y + h + padding)
    return img_uint8_gray[y0:y1, x0:x1]


def gentle_preprocessing(img):
    """
    Full preprocessing pipeline used during training.
    Must be applied to every image before inference for results to match.

    Steps: cast to uint8 → grayscale → crop to ink → resize →
           CLAHE contrast enhancement → grayscale to 3-channel →
           MobileNet pixel scaling ([-1, 1]).
    """
    img_uint8 = np.clip(img, 0, 255).astype(np.uint8)

    if img_uint8.ndim == 3 and img_uint8.shape[-1] == 3:
        gray = cv2.cvtColor(img_uint8, cv2.COLOR_RGB2GRAY)
    else:
        gray = img_uint8.squeeze()

    gray = crop_to_ink(gray, padding=20)
    gray_resized = cv2.resize(gray, (INPUT_W, INPUT_H), interpolation=cv2.INTER_AREA)

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray_resized)

    rgb = np.stack([enhanced, enhanced, enhanced], axis=-1).astype(np.float32)
    return preprocess_input(rgb)

def prepare_image_for_gradcam(image_path):
    """
    Preprocess an image for Grad-CAM in EXACTLY the same way as for inference.
    Returns: (1, 224, 448, 3) numpy array ready for the model.
    """
    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"Could not read image: {image_path}")
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_processed = gentle_preprocessing(img)
    return np.expand_dims(img_processed, axis=0)

# -----------------------------------------------------------------------------
# Architecture
# -----------------------------------------------------------------------------

class ColumnPool(layers.Layer):
    """
    Collapses the vertical spatial axis of the CNN feature map by averaging,
    leaving horizontal position as a sequence dimension for the BiLSTM.

    Input:  (batch, H', W', C)
    Output: (batch, W', C)

    Replaces a Lambda layer to avoid Keras 3 serialization issues.
    No trainable weights — purely a tf.reduce_mean operation.
    """
    def call(self, x):
        return tf.reduce_mean(x, axis=1)

    def get_config(self):
        return super().get_config()


def build_model(input_shape=INPUT_SHAPE):
    """
    MobileNetV2 backbone → column-pool → Dense → BiLSTM → Dense → sigmoid.
    Returns (model, base) — base is the MobileNetV2 reference, needed by
    Grad-CAM in some setups but unused for plain inference.
    """
    base = MobileNetV2(
        input_shape=input_shape,
        include_top=False,
        weights="imagenet",
    )
    base.trainable = False

    inputs = layers.Input(shape=input_shape)
    x = base(inputs, training=False)

    x = ColumnPool(name="column_pool")(x)

    x = layers.Dense(128, activation="relu")(x)
    x = layers.Dropout(0.3)(x)

    x = layers.Bidirectional(layers.LSTM(64, return_sequences=False))(x)
    x = layers.Dropout(0.4)(x)

    x = layers.Dense(32, activation="relu")(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(1, activation="sigmoid")(x)

    model = models.Model(inputs, outputs)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="binary_crossentropy",
        metrics=["accuracy"],
    )
    return model, base

def preprocess_from_path(image_path):
    """Load image from disk and run the full preprocessing pipeline."""
    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"Could not read image: {image_path}")
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    return gentle_preprocessing(img)


def predict_one(image_path, model, threshold=0.5):
    """
    Load, preprocess, and predict on a single image.

    Returns:
        prob       : float in [0, 1]
        pred_class : 0 or 1
        label      : "Dysgraphia" or "Non-Dysgraphia"
    """
    img = preprocess_from_path(image_path)
    batch = np.expand_dims(img, axis=0)
    prob = float(model.predict(batch, verbose=0).flatten()[0])
    pred_class = 1 if prob >= threshold else 0
    label = "Dysgraphia" if pred_class == 1 else "Non-Dysgraphia"
    return prob, pred_class, label


def run_model(image_path, model, threshold=0.5):
    """Wrapper for predict_one — matches the name used in views.py."""
    return predict_one(image_path, model, threshold)