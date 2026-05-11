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

#model imports!
from .model_learning import testing_model as ts
from .model_learning import feature_extractions as features
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
        
        # Call your existing extraction function.
        # ADJUST THIS LINE to match your actual signature:
        #   - If extractions accepts an output path:
        #       features.extractions(file_path, output_path=out_path)
        #   - If it returns the saved path:
        #       out_path = features.extractions(file_path)
        #   - If it always saves to a fixed location:
        #       features.extractions(file_path), then move/copy that file to out_path
        hpp, merged_lines, count_under_lines, count_above_lines = features.extractions(
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
        }

    
    #Get the file to model
    def post(self,request):

        file = request.FILES.get("myfile")
        
        if not file:
            return Response({
                "error": "Got no File \n "},status=400
            )
        file_path = self.save_file(request) #self -> save_files in the same class.
        # allowed_ext = (".png",".jpg","jpeg")
        # if file.name.lower().endswith(allowed_ext) not in allowed_ext:
        #     return Response({
        #df["profile_img"] = df["profile_img"].notna().astype(intdf["profile_img"] = df["profile_img"].notna().astype(int))         "error":"Invalid file type."
        #     },status = 415)
        try:
            
            prob,pred_class,label = ts.run_model(file_path)
            print("Model finished First part\n")
            features_data = self.images_features(file_path,request)
            print("Model Done ! the prob is  \n",prob)
            
            
            return Response(
                {"prob":float(prob.numpy().item()),"pred_class":int(pred_class),"label":str(label),
                 "features":features_data},status=200) ## float(prob) was changed to float(prob.numpy().item())
            
        except Exception as err:
            return Response({
                    "error":"Model failed",
                    "details": str(err)
                },status = 500)
        
    


            
