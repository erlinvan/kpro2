from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404
from trckpck.app.models import Package, Company
from trckpck.app.decorators import check_authorization
from django.core.management import call_command


@check_authorization
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
        packages = Package.objects.filter(company_owner=Company.objects.get(pk=company_id))
    else:
        packages = Package.objects.all()

    packages_data = []
    for package in packages:
        timestamp, gps = package.get_latest_timestamp_and_position()
        packages_data.append({
            'id': package.id,
            'timestamp': timestamp,
            'gps': gps
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

def init_db(request):
    call_command('initdb')
    return HttpResponse(content="ok", status=200)
