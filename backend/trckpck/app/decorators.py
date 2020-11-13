from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404
from trckpck.app.models import Package, AppUser, Company


permissions = {'user': ['apple', 'komplett']}
superusers = ['superuser']


def check_authorization(func):
    def wrapper(request, *args, **kwargs):
        if 'X-username' in request.headers:
            username = request.headers['X-username']
            package_id = request.GET.get('id')
            company_id = request.GET.get('company')
            try:
                user = AppUser.objects.get(pk=username)
                if user.is_superuser:
                    return func(request, *args, **kwargs)
                if package_id:
                    package = get_object_or_404(Package, pk=package_id)
                    company_id = package.company_owner.company_name
                company = Company.objects.get(pk=company_id)
                if user in company.appuser_set.all():
                    return func(request, *args, **kwargs)
            except (AppUser.DoesNotExist, Company.DoesNotExist):
                pass

        return HttpResponseForbidden(
            "You don't have the permissions to view this page")
    return wrapper
