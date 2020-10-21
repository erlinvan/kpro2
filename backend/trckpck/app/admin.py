from django.contrib import admin
from trckpck.app.models import Package, Beacon, AppUser, Company

# Register your models here.
admin.site.register(Package)
admin.site.register(Beacon)
admin.site.register(AppUser)
admin.site.register(Company)