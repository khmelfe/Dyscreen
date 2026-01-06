from tensorflow.keras.models import load_model
from . import preprocess
import numpy as np
import cv2
import os
#from django.conf import settings

classes = ["No-Dyslexia","Dyslexia"]

#MODEL_PATH = os.path.join(settings.BASE_DIR, "model_learning", "iheb_model.h5")

def predict_one(image,model,threshold=0.5):
        print("1\n")
        img = preprocess_image(image,size=(128,128))
        img = img/255.0
        img = np.expand_dims(img,axis=-1)
        img = np.expand_dims(img,axis=0)

        img3 = np.repeat(img,3,axis=-1)
        # prob = float(model.predict(img3,verbose=0)[0][0]) 
        prob = model(img3,training=False)

        pred_class= 1 if prob > threshold else 0 
        return prob,pred_class,classes[pred_class]

def preprocess_image(image_path, size=(128, 128)):
        try :
            image = cv2.imread(image_path)
        
            image = preprocess.convert_to_grayscale(image)
            
            image = preprocess.reduce_noise(image, method="gaussian")
            print("well2\n")
            image = preprocess.binarize_image(image)
            image = preprocess.resize_image(image, size=size)
            #image = deskew_image(image)
            image = preprocess.add_padding(image, target_size=size)
            return image
              
        except Exception as err:
            print(err)
            
def preprocess_image_from_bytes(file_bytes, size=(128, 128)):
    image = cv2.decode_image_from_bytes(file_bytes)
    return image
def run_model(image_path):
    
    model = load_model("Dyscreen/model_learning/iheb_model.h5")
    
    prob,pred_class,label = predict_one(image_path,model,0.5)

    return prob,pred_class,label





