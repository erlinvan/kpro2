""" Urls """
from django.urls import path
from trckpck.app.views import get_tracker_data, init_db


urlpatterns = [
    path('', get_tracker_data, name='tracker_data'),
    path('init/', init_db, name='init_db'),
]
