# my_project/urls.py

from django.contrib import admin
from django.urls import path, include
from app.chat.consumers import ChatConsumer

from app import views

urlpatterns = [
    path('', include('django_prometheus.urls')),
    path('admin/', admin.site.urls),
    path('health', views.health),
    path('ready', views.ready),
]
