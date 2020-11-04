""" Urls """
from django.urls import path
from trckpck.app.views import get_tracker_data, init_db, get_user_data


urlpatterns = [
    path('', get_tracker_data, name='tracker_data'),
    path('userdata/', get_user_data, name='user_data'),
    path('init/', init_db, name='init_db'),
]
