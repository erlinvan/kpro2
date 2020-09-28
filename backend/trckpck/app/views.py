from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.conf import settings
import boto3
from boto3.dynamodb.conditions import Key
from django.shortcuts import get_object_or_404
from trckpck.app.models import Package


def data_dump(request):
    """Retrieves full data-dump from table settings.DATA_TABLE. Currently not in use"""
    dynamodb = boto3.resource('dynamodb', region_name='eu-west-1')
    table = dynamodb.Table(settings.DATA_TABLE)
    data = table.scan()
    items = data.get('Items', [])
    return JsonResponse(items, safe=False)


def get_tracker_data(request):
    package_id = request.GET.get('id')
    company_id = request.GET.get('company')
    if package_id:
        return get_package_data_by_package_id(package_id)
    else:
        return list_packages(company_id)


def list_packages(company_id):
    packages = []
    if company_id:
        packages = Package.objects.filter(company_owner=company_id)
    else:
        packages = Package.objects.all()

    packages_data = []
    for package in packages:
        packages_data.append((
            package.id,
            package.get_latest_timestamp()
        ))
    return JsonResponse(packages[0].get_latest_timestamp(), safe=False)


def package_dump(request):
    """Retrieves a dump of all packages in the database"""
    packages = Package.objects.all()
    packages_data = []
    for package in packages:
        payload = {
            'company_owner': package.company_owner,
            'tracker_id': package.tracker_id,
            'data': package.get_package_data()
        }
        packages_data.append(payload)
    return JsonResponse(packages_data, safe=False)


def get_package_data_by_id(request, id):
    """Retrieves one record from dynamodb with pk=id"""
    dynamodb = boto3.resource('dynamodb', region_name='eu-west-1')
    table = dynamodb.Table(settings.DATA_TABLE)
    response = table.query(
        KeyConditionExpression=Key(settings.DATA_TABLE_PK).eq(id)
    )
    items = response.get('Items', [])
    return JsonResponse(items, safe=False)


def get_package_data_by_package_id(id):
    """Retrieves all records for packet with id=id"""
    package = get_object_or_404(Package, pk=id)
    items = package.get_package_data()
    return JsonResponse(items, safe=False)


def get_packages_data_by_company_id(request, id):
    """Retrieves all packages with data for company with id=id"""
    packages = Package.objects.filter(company_owner=id.lower())
    packages_data = []
    for package in packages:
        packages_data.append(package.get_package_data())
    return JsonResponse(packages_data, safe=False)


