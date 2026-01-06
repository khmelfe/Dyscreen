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
#model imports!
from .model_learning import testing_model as ts



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
        #         "error":"Invalid file type."
        #     },status = 415)
        try:
            print("Well\n")
            prob,pred_class,label = ts.run_model(file_path)
            print("Model Done ! the prob is  \n",prob)
            
            return Response({"prob":float(prob),"pred_class":int(pred_class),"label":str(label)},status=200) 
            
        except Exception as err:
            return Response({
                    "error":"Model failed",
                    "details": str(err)
                },status = 500)