from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404
from trckpck.app.models import Package


permissions = {'user': ['apple', 'komplett']}
superusers = ['superuser']


def check_authorization(func):
    def wrapper(request, *args, **kwargs):
        if 'X-username' in request.headers:
            username = request.headers['X-username']
            package_id = request.GET.get('id')
            company_id = request.GET.get('company')
            if username in superusers:
                return func(request, *args, **kwargs)
            if package_id:
                package = get_object_or_404(Package, pk=package_id)
                company_id = package.company_owner
            if username in permissions and company_id in permissions[username]:
                return func(request, *args, **kwargs)
        return HttpResponseForbidden("You don't have the permissions to view this page")
    return wrapper
