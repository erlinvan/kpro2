from django.core.management.base import BaseCommand, CommandError
from trckpck.app.models import Package

class Command(BaseCommand):
    help = 'Fills the database with some dummy data'

    def handle(self, *args, **options):
        try:
            Package.objects.create(
                company_owner='apple',
                tracker_id='test'
            )
        except Exception:
            raise Exception("Something went wrong. Most likely this command has already been run and  the packages are in the database")

        print("Package with company_owner=apple and tracker_id=test was created")
