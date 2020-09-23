from django.contrib import admin
from django.urls import path, include
from trckpck.app.views import package_dump, get_package_data_by_id, get_package_data_by_package_id, get_packages_data_by_company_id


urlpatterns = [
    path('', package_dump, name='package_dump'),
    path('<str:id>/', get_package_data_by_id, name='get_package_data_by_id'),
    path('package/<int:id>/', get_package_data_by_package_id, name='get_package_data_by_package_id'),
    path('package/<str:id>/', get_packages_data_by_company_id, name='get_packages_data_by_company_id')

]
