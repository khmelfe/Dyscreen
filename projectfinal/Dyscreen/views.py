from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import FileSystemStorage
#imports for the model:
import pandas as pd
import numpy as np
from django.http import JsonResponse
from  rest_framework.views import APIView
from django.conf import settings
import os
import uuid
import keras
#model imports!
from tensorflow.keras.models import load_model
from .model_learning import testing_model as ts
from .model_learning import Model_V3 
from .model_learning import feature_extractions as features
from .model_learning import Heatmap_extractions as HT # heatmaps functions.
#Database connection


@api_view(["GET"])
def hello(request):
    return Response({"message": "Hello2 from Django"})

from django.http import JsonResponse
from mongo1 import db

def ping_mongo(request):
    db.health.insert_one({"ping": "pong"})
    return JsonResponse({
        "ok": True,
        "collections": db.list_collection_names()
    })

class file_model_functions(APIView):
    parser_classes = [MultiPartParser, FormParser]

    _model = None
    @classmethod
    def get_model(cls,selected_model = "CNN_LSTM"):
        if cls._model is None:
            print("Loading model for the first time,Choosen Model is : ",selected_model)
            chosen_model =""
            from .model_learning.Model_V3 import build_model, INPUT_SHAPE
            cls._model, _ = build_model(input_shape=INPUT_SHAPE)
            if(selected_model == "CNN_LSTM"):
                 #CNN + LSTM
                 chosen_model = selected_model
                 cls._model.load_weights(
                "Dyscreen/model_learning/dysgraphia_v3_bilingual_best_test1.keras"
            ) 
            else : 
                chosen_model = selected_model
                  #R2CNN + TRPN
                cls._model.load_weights(
                "Dyscreen/model_learning/dysgraphia_R2CNN_TRPN_hebrew_finetuned.keras"
            ) 
            
            # Trial 1
            # cls._model.load_weights(
            #     "Dyscreen/model_learning/dysgraphia_v3_bilingual_best_test1.keras"
            # ) 
            #Trial 2 
            # cls._model.load_weights(
            #     "Dyscreen/model_learning/dysgraphia_v3_bilingual_best_test2.keras"
            # ) 
            

            print("The Chosen Model is : ", chosen_model)
        return cls._model
        
    
    
    def save_file(self,request):
        
        print("Saving File \n")
        f = request.FILES.get("myfile")
        upload_dir = os.path.join(settings.MEDIA_ROOT, "uploads")
        fs = FileSystemStorage(location=upload_dir)
        filename = fs.save(f.name, f)   # returns stored filename
        file_path  = fs.path(filename)        
        return file_path
    
    def images_features(self, file_path, request):
        """
        Runs feature extraction. Returns a dict with:
          - annotated_url: URL the frontend can load the image from
          - hpp, merged_lines, count_under_lines, count_above_lines
        Raises on failure (caller builds the Response).
        """
        # Make sure the output directory exists
        annotated_dir = os.path.join(settings.MEDIA_ROOT, "annotated")
        os.makedirs(annotated_dir, exist_ok=True)

        # Unique output filename so concurrent uploads don't collide
        out_name = f"{uuid.uuid4().hex}.png"
        out_path = os.path.join(annotated_dir, out_name)
        
        #       features.extractions(file_path), then move/copy that file to out_path
        hpp, merged_lines, count_under_lines, count_above_lines,spaces,large_gap_count,total_words,avg_spaces = features.extractions(
            file_path, output_path=out_path
        )
        
        # Build a URL the frontend can use (e.g. /media/annotated/abc123.png)
        annotated_url = request.build_absolute_uri(
            settings.MEDIA_URL + "annotated/" + out_name
        )
        print("Url",annotated_url)
        return {
            "annotated_url": annotated_url,
            "hpp": hpp.tolist() if hasattr(hpp, "tolist") else hpp,
            "merged_lines": merged_lines,
            "count_under_lines": int(count_under_lines),
            "count_above_lines": int(count_above_lines),
            "total_words_found" :int(total_words),
            "amount_spaces" : spaces,
            "large_gap_count" : int(large_gap_count), #spaces between words that above the avg.
            "avg_spaces" :int(avg_spaces)
        } # there is a problem 

    
    #Get the file to model
    def post(self,request):

        file = request.FILES.get("myfile")
        model_to_use = request.data.get("model")
        print("Choosen Model is : ",model_to_use)
        if not file:
            return Response({
                "error": "Got no File \n "},status=400
            )
        file_path = self.save_file(request) #self -> save_files in the same class.
     
        try: 
            #model = load_model("Dyscreen/model_learning/iheb_model.h5") old model.
            model = self.get_model(model_to_use)

            # Run inference — prob is already a plain Python float.
            prob, pred_class, label = Model_V3.run_model(file_path, model)
            print(f"Prediction: {label} ({prob:.4f})\n")

            #Features_Data
            features_data = self.images_features(file_path,request)
            print("Model Done ! the prob is  \n",prob)

            #Heatmap 

            heatmap_name = f"heatmap_{uuid.uuid4().hex}.png"
            heatmap_dir = os.path.join(settings.MEDIA_ROOT, "heatmaps")
            os.makedirs(heatmap_dir, exist_ok=True)
            heatmap_path = os.path.join(heatmap_dir, heatmap_name)

            img_array = HT.prepare_image_for_gradcam(file_path)
            heatmap = HT.get_gradcam_heatmap(img_array, model)   # ← new function name
            HT.save_heatmap_only(
                img_path=file_path,
                heatmap=heatmap,
                save_path=heatmap_path,
            )

            heatmap_url = request.build_absolute_uri(
                settings.MEDIA_URL + "heatmaps/" + heatmap_name
            )

            print("Heatmap generated")

            return Response({

                "prob": float(prob),

                "pred_class": int(pred_class),

                "label": str(label),

                "features": features_data,

                "heatmap_url": heatmap_url,

                "Orignal_photo" : file_path

            }, status=200)
                
        except Exception as err:
            print(err)
            return Response({
                    "error":"Model failed",
                    "details": str(err)
                },status = 500)
        
    def delete(self,request):
        '''
        Removing the Data the User uploaded.
        '''
        print(request.data)
        
        for elem in request.data:
            elem.get() #file
            elem = elem.replace("http://127.0.0.1:8000/","")
            
        photo_url = request.data.get("photo")
        heatmap_url =request.data.get("heatmap")
        Orignal_url = request.data.get("OG")
        photo_url = photo_url.replace("http://127.0.0.1:8000/","") # the slash is the most important thing!
        heatmap_url = heatmap_url.replace("http://127.0.0.1:8000/","")
        Orignal_url = Orignal_url.replace("http://127.0.0.1:8000/","")
        print("url ", Orignal_url)
              
        try:
        
            if(os.path.exists(photo_url)):
                print("Found path")
                os.remove(photo_url)
            if(os.path.exists(heatmap_url)):
                os.remove(heatmap_url)
            if(os.path.exists(Orignal_url)):
                os.remove(Orignal_url)
            return Response({
            "Result": "Success"
            },status= 200)
        
        except Exception as err:
            return Response({
                "Result":"Failed",
                "error": f'This error has be ariesd {err}'
            },status = 500)
    
