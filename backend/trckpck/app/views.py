from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.conf import settings
import boto3
from boto3.dynamodb.conditions import Key
from django.shortcuts import get_object_or_404
from trckpck.app.models import Package


def get_tracker_data(request):
    """ /tracker with query parameters """
    package_id = request.GET.get('id')
    company_id = request.GET.get('company')
    if package_id:
        return get_package_data_by_package_id(package_id)
    else:
        return list_packages(company_id)


def list_packages(company_id):
    """ /tracker?company=company_id  """
    packages = []
    if company_id:
        packages = Package.objects.filter(company_owner=company_id)
    else:
        packages = Package.objects.all()

    packages_data = []
    for package in packages:
        packages_data.append({
            'id': package.id,
            'timestamp': package.get_latest_timestamp()
        })
    return JsonResponse(packages_data, safe=False)


def get_package_data_by_package_id(id):
    """Retrieves all records for packet with id=id"""
    package = get_object_or_404(Package, pk=id)
    items = package.get_package_data()
    return JsonResponse(items, safe=False)


def get_packages_data_by_company_id(request, id):
    """Retrieves all packages with data for company with id=id, might be useful later"""
    packages = Package.objects.filter(company_owner=id.lower())
    packages_data = []
    for package in packages:
        packages_data.append(package.get_package_data())
    return JsonResponse(packages_data, safe=False)

