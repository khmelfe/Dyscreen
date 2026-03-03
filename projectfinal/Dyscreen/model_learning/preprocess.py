import os
import cv2
import numpy as np
import matplotlib.pyplot as plt
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import VGG16
from tensorflow.keras.models import Model, Sequential
from tensorflow.keras.layers import Dense, Flatten, Dropout, GlobalAveragePooling2D
from tensorflow.keras.optimizers import Adam
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report

# Step 2: Preprocessing Functions
def convert_to_grayscale(image):
    
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

def reduce_noise(image, method="gaussian"):
    if method == "gaussian":
        return cv2.GaussianBlur(image, (5, 5), 0)
    elif method == "median":
        return cv2.medianBlur(image, 5)

def binarize_image(image):
    _, binary_image = cv2.threshold(image, 127, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
    return binary_image

def resize_image(image, size=(128, 128)):
    return cv2.resize(image, size, interpolation=cv2.INTER_AREA)

"""def deskew_image(image):
    coords = np.column_stack(np.where(image > 0))
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    return cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)"""

def add_padding(image, target_size=(128, 128)):
    old_size = image.shape[:2]
    delta_w = target_size[1] - old_size[1]
    delta_h = target_size[0] - old_size[0]
    top, bottom = delta_h // 2, delta_h - (delta_h // 2)
    left, right = delta_w // 2, delta_w - (delta_w // 2)
    color = [0, 0, 0]  # Black padding
    return cv2.copyMakeBorder(image, top, bottom, left, right, cv2.BORDER_CONSTANT, value=color)

def preprocess_image(image_path, size=(128, 128)):
    image = cv2.imread(image_path)
    image = convert_to_grayscale(image)
    image = reduce_noise(image, method="gaussian")
    image = binarize_image(image)
    image = resize_image(image, size=size)
    #image = deskew_image(image)
    image = add_padding(image, target_size=size)
    return image


#pip install opencv-python numpy matplotlib tensorflow scikit-learn pytesseract Metaphone pandas requests