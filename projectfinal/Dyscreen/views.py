from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response


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