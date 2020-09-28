from django.contrib import admin
from django.urls import path, include
from trckpck.app.views import get_tracker_data
# from trckpck.app.views import package_dump, get_package_data_by_id, get_package_data_by_package_id, get_packages_data_by_company_id


urlpatterns = [
    path('', get_tracker_data, name='tracker_data'),
]
