from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from .services.gemini_client import ask_gemini

class ChatAPI(APIView):
    def post(self, request):
        msg = request.data.get("message", "")
        reply = ask_gemini(msg)
        return Response({"reply": reply})
