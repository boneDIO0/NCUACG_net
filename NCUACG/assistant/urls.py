# NCUACG/assistant/urls.py
from django.urls import path
from .views import ChatAPI

app_name = "assistant"

urlpatterns = [
    path("chat/", ChatAPI.as_view(), name="chat"),
]
