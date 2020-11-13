""" Views """
from django.http import JsonResponse, HttpResponse, HttpResponseForbidden
from django.shortcuts import get_object_or_404
from django.core.management import call_command
from trckpck.app.models import Package, Company, AppUser
from trckpck.app.decorators import check_authorization


@check_authorization
def get_tracker_data(request):
    """ /tracker with query parameters """
    package_id = request.GET.get('id')
    company_id = request.GET.get('company')
    if package_id:
        return get_package_data_by_package_id(package_id)
    return list_packages(company_id)


def get_user_data(request):
    """ /tracker/userdata """
    try:
        username = request.headers['X-username']
        user = AppUser.objects.get(pk=username)
        if user.is_superuser:
            packages = Package.objects.all()
        else:
            packages = Package.objects.filter(company_owner__appuser=user)
        packages_data = []
        for package in packages:
            timestamp, gps = package.get_latest_timestamp_and_position()
            if timestamp and gps:
                packages_data.append({
                    'id': package.id,
                    'timestamp': timestamp,
                    'company': package.company_owner.company_name,
                    'gps': gps
                })
        packages_data.sort(key=lambda p: p['timestamp'], reverse=True)
        return JsonResponse(packages_data, safe=False)

    except AppUser.DoesNotExist:
        return HttpResponseForbidden(
            "You don't have the permissions to view this page")


def list_packages(company_id):
    """ /tracker?company=company_id  """
    packages = []
    if company_id:
        packages = Package.objects.filter(
            company_owner=Company.objects.get(pk=company_id))
    else:
        packages = Package.objects.all()

    packages_data = []
    for package in packages:
        timestamp, gps = package.get_latest_timestamp_and_position()
        if timestamp and gps:
            packages_data.append({
                'id': package.id,
                'timestamp': timestamp,
                'gps': gps
            })

    packages_data.sort(key=lambda p: p['timestamp'], reverse=True)
    return JsonResponse(packages_data, safe=False)


def get_package_data_by_package_id(id):
    """Retrieves all records for packet with id=id"""
    package = get_object_or_404(Package, pk=id)
    items = package.get_package_data()
    return JsonResponse(items, safe=False)


def get_packages_data_by_company_id(_, id):
    """Retrieves all packages with data for company with id=id, might be useful later"""
    packages = Package.objects.filter(company_owner=id.lower())
    packages_data = []
    for package in packages:
        packages_data.append(package.get_package_data())
    return JsonResponse(packages_data, safe=False)


def init_db(_):
    """ Initalize database """
    call_command('initdb')
    return HttpResponse(content="ok", status=200)
