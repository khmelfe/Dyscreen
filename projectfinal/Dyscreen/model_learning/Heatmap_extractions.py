# import cv2
# import numpy as np
# import tensorflow as tf
# import matplotlib.pyplot as plt
# import matplotlib.cm as cm

# def find_last_conv_layer(model):

#     # Search normal layers first
#     for layer in reversed(model.layers):

#         if isinstance(layer, tf.keras.layers.Conv2D):
#             return layer.name

#         # If nested model, search inside it
#         if isinstance(layer, tf.keras.Model):

#             for inner_layer in reversed(layer.layers):

#                 if isinstance(inner_layer, tf.keras.layers.Conv2D):
#                     return inner_layer.name

#     raise ValueError("No Conv2D layer found in model.")


# def get_gradcam_heatmap(img_array, model, last_conv_layer_name="Conv1"):
#     # Find the nested base model by type, not by index.
#     # In some architectures index 0 is the Input layer, not the base.

#     base_model = None
#     base_index = None
#     for i, layer in enumerate(model.layers):
#         if isinstance(layer, tf.keras.Model):
#             base_model = layer
#             base_index = i
#             break

#     if base_model is None:
#         raise ValueError("Could not find nested base model.")

#     # Auto-detect last conv layer if not provided.
#     if last_conv_layer_name is None:
#         last_conv_layer_name = find_last_conv_layer(model)

#     conv_layer = base_model.get_layer(last_conv_layer_name)

#     grad_model = tf.keras.Model(
#         inputs=base_model.input,
#         outputs=[conv_layer.output, base_model.output],
#     )

#     img_tensor = tf.convert_to_tensor(img_array, dtype=tf.float32)

#     with tf.GradientTape() as tape:
#         conv_output, x = grad_model(img_tensor, training=False)

#         # Re-run the rest of the model (everything after the base) on top.
#         for layer in model.layers[base_index + 1:]:
#             x = layer(x, training=False)

#         class_channel = x[:, 0]

#     grads = tape.gradient(class_channel, conv_output)
#     if grads is None:
#         raise ValueError("Gradients are None.")

#     pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
#     conv_output = conv_output[0]
#     heatmap = conv_output @ pooled_grads[..., tf.newaxis]
#     heatmap = tf.squeeze(heatmap)
#     heatmap = tf.maximum(heatmap, 0)
#     heatmap = heatmap / (tf.reduce_max(heatmap) + 1e-10)
#     return heatmap.numpy()


# def display_gradcam(img_path, heatmap, alpha=0.4, save_path="heatmap.png"):
#     img = cv2.imread(img_path)

#     if img is None:
#         raise ValueError("Could not read image for heatmap display.")

#     img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

#     original_h, original_w = img.shape[:2]

#     heatmap_uint8 = np.uint8(255 * heatmap)

#     jet = cm.get_cmap("jet")
#     jet_colors = jet(np.arange(256))[:, :3]
#     jet_heatmap = jet_colors[heatmap_uint8]

#     jet_heatmap = tf.keras.utils.array_to_img(jet_heatmap)
#     jet_heatmap = jet_heatmap.resize((original_w, original_h))
#     jet_heatmap = tf.keras.utils.img_to_array(jet_heatmap)

#     superimposed = jet_heatmap * alpha + img
#     superimposed = np.clip(superimposed, 0, 255).astype(np.uint8)

#     plt.figure(figsize=(10, 10))
#     plt.imshow(superimposed)
#     plt.axis("off")
#     plt.savefig(save_path, bbox_inches="tight", pad_inches=0)
#     plt.close()

#     print(f"Grad-CAM saved to {save_path}")
    


# Heatmap_extractions.py
# Grad-CAM generation + professional visualization for the Django app.

import cv2
import numpy as np
import matplotlib
matplotlib.use("Agg")   # non-interactive backend for server use
import matplotlib.pyplot as plt
import matplotlib.cm as cm
import matplotlib.gridspec as gridspec
import tensorflow as tf

from .Model_V3 import INPUT_H, INPUT_W, gentle_preprocessing


def prepare_image_for_gradcam(image_path):
    """Load image from disk and preprocess for the model."""
    img_raw = cv2.imread(image_path)
    if img_raw is None:
        raise FileNotFoundError(f"Could not read image: {image_path}")
    img_raw = cv2.cvtColor(img_raw, cv2.COLOR_BGR2RGB)
    img_processed = gentle_preprocessing(img_raw)
    return np.expand_dims(img_processed, axis=0)


def get_gradcam_heatmap(img_array, model, last_conv_layer_name=None):
    """
    Grad-CAM that finds the last conv layer dynamically.

    Robust to layer-name shifts across Keras versions and save/load cycles.
    """
    # Find the nested base model.
    base_model = None
    for layer in model.layers:
        if isinstance(layer, tf.keras.Model):
            base_model = layer
            break
    if base_model is None:
        raise ValueError("Could not find any nested model.")

    # Descend in case base wraps another model.
    while True:
        inner_models = [l for l in base_model.layers if isinstance(l, tf.keras.Model)]
        has_conv = any(isinstance(l, tf.keras.layers.Conv2D) for l in base_model.layers)
        if has_conv or not inner_models:
            break
        base_model = inner_models[0]

    # Locate the target conv layer.
    target_layer = None
    if last_conv_layer_name:
        try:
            target_layer = base_model.get_layer(last_conv_layer_name)
        except ValueError:
            pass
    if target_layer is None:
        for layer in reversed(base_model.layers):
            if isinstance(layer, tf.keras.layers.Conv2D):
                target_layer = layer
                break
    if target_layer is None:
        raise ValueError(
            f"Could not find any Conv2D layer in nested model '{base_model.name}'."
        )
    print(f"  [Grad-CAM] Using layer '{target_layer.name}' "
          f"in nested model '{base_model.name}'.")

    grad_model = tf.keras.models.Model(
        inputs=base_model.input,
        outputs=[target_layer.output, base_model.output],
    )

    with tf.GradientTape() as tape:
        conv_output, base_output = grad_model(img_array)
        x = base_output

        passed_base = False
        for layer in model.layers:
            if layer.name == base_model.name:
                passed_base = True
                continue
            if not passed_base:
                continue
            if "MultiHeadAttention" in layer.__class__.__name__:
                x = layer(query=x, value=x, key=x)
            else:
                x = layer(x)

        class_channel = x[:, 0]

    grads = tape.gradient(class_channel, conv_output)
    if grads is None:
        raise RuntimeError(
            "Grad-CAM gradients are None. The gradient path between the "
            "target conv layer and the output is broken."
        )
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_output = conv_output[0]
    heatmap = conv_output @ pooled_grads[..., tf.newaxis]
    return (tf.maximum(tf.squeeze(heatmap), 0)
            / (tf.math.reduce_max(heatmap) + 1e-10)).numpy()


def overlay_heatmap(display_img_01, heatmap, alpha=0.4):
    """
    Simple uniform-opacity overlay.
    display_img_01: image in [0, 1] range, HxWx3.
    """
    display = (display_img_01 * 255).astype(np.uint8)
    jet_colors = plt.colormaps.get_cmap("jet")(np.uint8(255 * heatmap))
    jet_heatmap = (jet_colors[:, :, :3] * 255).astype(np.uint8)
    jet_heatmap = cv2.resize(jet_heatmap, (display.shape[1], display.shape[0]))
    superimposed = jet_heatmap.astype(np.float32) * alpha + display.astype(np.float32)
    return np.clip(superimposed, 0, 255).astype(np.uint8)


# def display_gradcam_professional(img_path, heatmap, pred_prob,
#                                   true_label=None, save_path="gradcam.png"):
#     """
#     Save the professional dark-mode Grad-CAM visualization with attention-
#     proportional opacity (hot spots colored, cold regions clear).
#     """
#     BG_COLOR = "#1a1a2e"

#     # Load original image.
#     img = cv2.imread(img_path)
#     if img is None:
#         raise FileNotFoundError(f"Could not read image: {img_path}")
#     img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
#     display_size = (INPUT_W * 2, INPUT_H * 2)
#     img_display = cv2.resize(img, display_size)

#     # Build heatmap overlay with attention-proportional opacity.
#     heatmap_resized = cv2.resize(
#         heatmap, display_size, interpolation=cv2.INTER_CUBIC
#     )
#     heatmap_resized = np.clip(heatmap_resized, 0, 1)

#     jet = cm.get_cmap("jet")
#     jet_colored = jet(heatmap_resized)[..., :3]
#     jet_colored = (jet_colored * 255).astype(np.float32)

#     # Per-pixel alpha based on heatmap intensity.
#     alpha_map = heatmap_resized ** 1.3
#     alpha_map = alpha_map * 0.6
#     alpha_3ch = np.stack([alpha_map, alpha_map, alpha_map], axis=-1)

#     img_float = img_display.astype(np.float32)
#     overlay = jet_colored * alpha_3ch + img_float * (1.0 - alpha_3ch)
#     overlay = np.clip(overlay, 0, 255).astype(np.uint8)

#     # # Labels and colors.
#     # pred_label = "Dysgraphia" if pred_prob > 0.5 else "Non-Dysgraphia"
#     # pred_color = "#ff4444" if pred_prob > 0.5 else "#44ff88"

#     # true_str = ""
#     # correct_str = ""
#     # correct_color = "#cccccc"
#     # # if true_label is not None:
#     # #     true_name = "Dysgraphia" if true_label == 1 else "Non-Dysgraphia"
#     # #     correct = (pred_prob > 0.5) == (true_label == 1)
#     # #     true_str = f"True label: {true_name}"
#     # #     correct_str = "✓ Correct" if correct else "✗ Incorrect"
#     # #     correct_color = "#44ff88" if correct else "#ff4444"

#     # # Figure layout.
#     # fig = plt.figure(figsize=(20, 8), facecolor=BG_COLOR)
#     # gs = gridspec.GridSpec(
#     #     1, 1,
#     #     width_ratios=[5, 5, 1.8],
#     #     wspace=0.06,
#     #     left=0.03, right=0.97,
#     #     top=0.82, bottom=0.08,
#     # )

#     # ax_heat = fig.add_subplot(gs[1])
#     # ax_heat.imshow(overlay)
#     # ax_heat.set_title("Grad-CAM Attention Map", color="white",
#     #                   fontsize=13, fontweight="bold", pad=8)
#     # ax_heat.axis("off")

#     # ax_panel = fig.add_subplot(gs[2])
#     # ax_panel.set_facecolor(BG_COLOR)
#     # ax_panel.axis("off")
#     # ax_panel.set_title("Attention\nScale", color="white",
#     #                    fontsize=12, fontweight="bold", pad=8)

#     # cax = ax_panel.inset_axes([0.15, 0.12, 0.28, 0.76])
#     # norm = plt.Normalize(vmin=0, vmax=1)
#     # sm = cm.ScalarMappable(norm=norm, cmap="jet")
#     # sm.set_array([])
#     # cb = fig.colorbar(sm, cax=cax)
#     # cb.set_ticks([0.0, 0.25, 0.5, 0.75, 1.0])
#     # cb.set_ticklabels(["0.0", "0.25", "0.5", "0.75", "1.0"])
#     # cb.ax.yaxis.set_tick_params(color="white", labelsize=9)
#     # plt.setp(cb.ax.yaxis.get_ticklabels(), color="white")
#     # cb.outline.set_edgecolor("white")

#     # levels = [
#     #     (0.88, "#ff2200", "Very High",   "Strongest influence"),
#     #     (0.70, "#ff8800", "High",        "Important regions"),
#     #     (0.50, "#ffff00", "Medium",      "Moderate influence"),
#     #     (0.30, "#00aaff", "Low",         "Lower influence"),
#     #     (0.10, "#0022ff", "Very Low",    "Background / minimal"),
#     # ]
#     # for y, color, title, subtitle in levels:
#     #     ax_panel.text(0.52, y, title, color=color, fontsize=10,
#     #                   fontweight="bold", transform=ax_panel.transAxes)
#     #     ax_panel.text(0.52, y-0.06, subtitle, color="#cccccc", fontsize=8,
#     #                   transform=ax_panel.transAxes)

#     # fig.text(0.6, 0.96, f"Grad-CAM Explanation — {pred_label}",
#     #          ha="center", va="center",
#     #          color=pred_color, fontsize=16, fontweight="bold")

#     # fig.text(0.6, 0.90, f"Model confidence: {pred_prob:.1%}",
#     #          ha="center", va="center",
#     #          color="white", fontsize=13)

#     # if true_label is not None:
#     #     fig.text(0.6, 0.86, f"{true_str}   |   {correct_str}",
#     #              ha="center", va="center",
#     #              color=correct_color, fontsize=12)

#     # fig.text(0.5, 0.03,
#     #          "Red/yellow regions indicate where the model focused most when making this prediction.\n"
#     #          "Grad-CAM highlights spatial attention — specific feature interpretation requires expert review.",
#     #          ha="center", va="center",
#     #          color="#aaaaaa", fontsize=9)

#     plt.savefig(save_path, bbox_inches="tight", dpi=150, facecolor=BG_COLOR)
#     plt.close(fig)
#     print(f"Saved: {save_path}")


def save_heatmap_only(img_path, heatmap, save_path,
                       max_alpha=0.6, fade_exponent=1.3):
    """
    Save just the heatmap overlay as a PNG. No matplotlib figure, no legend,
    no titles — just the image with the heatmap blended on top.

    Uses attention-proportional opacity so hot spots are colored and cold
    regions stay clear.
    """
    # Load original image.
    img = cv2.imread(img_path)
    if img is None:
        raise FileNotFoundError(f"Could not read image: {img_path}")
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    display_size = (INPUT_W * 2, INPUT_H * 2)
    img_display = cv2.resize(img, display_size)

    # Resize heatmap to display size, apply jet colormap.
    heatmap_resized = cv2.resize(heatmap, display_size, interpolation=cv2.INTER_CUBIC)
    heatmap_resized = np.clip(heatmap_resized, 0, 1)

    jet = cm.get_cmap("jet")
    jet_colored = jet(heatmap_resized)[..., :3]
    jet_colored = (jet_colored * 255).astype(np.float32)

    # Attention-proportional alpha: hot spots colored, cold areas transparent.
    alpha_map = (heatmap_resized ** fade_exponent) * max_alpha
    alpha_3ch = np.stack([alpha_map, alpha_map, alpha_map], axis=-1)

    img_float = img_display.astype(np.float32)
    overlay = jet_colored * alpha_3ch + img_float * (1.0 - alpha_3ch)
    overlay = np.clip(overlay, 0, 255).astype(np.uint8)

    # Save as PNG using OpenCV (RGB -> BGR for cv2.imwrite).
    overlay_bgr = cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR)
    cv2.imwrite(save_path, overlay_bgr)
    print(f"Saved: {save_path}")