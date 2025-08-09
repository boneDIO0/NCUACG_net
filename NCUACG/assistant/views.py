from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from .services.llama_client import ask_llama_rag as ask_model

class ChatAPI(APIView):
    def post(self, request):
        msg = request.data.get("message", "")
        reply = ask_model(msg)
        return Response({"reply": reply})
