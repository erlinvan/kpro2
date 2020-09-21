from django.contrib import admin
from django.urls import path, include
from trckpck.app.views import data_dump

urlpatterns = [
    path('', data_dump, name='data_dump'),
]

