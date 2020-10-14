from django.core.management.base import BaseCommand, CommandError
from trckpck.app.models import Package, Company

class Command(BaseCommand):
    help = 'Fills the database with some dummy data'

    def handle(self, *args, **options):
        try:
            company = Company.objects.create(
                company_name='apple'
            )
            Package.objects.create(
                company_owner=company,
                tracker_id='test'
            )
            for i in range(12):
                Package.objects.create(
                    company_owner='apple',
                    tracker_id=f'dummy_apple{i}'
                )

            for i in range(7):
                Package.objects.create(
                    company_owner='komplett',
                    tracker_id=f'dummy_komplett{i}'
                )

            for i in range(5):
                Package.objects.create(
                    company_owner='fjellsport',
                    tracker_id=f'dummy_fjellsport{i}'
                )
        except Exception:
            raise Exception("Something went wrong. Most likely this command has already been run and  the packages are in the database")

        print("Many packages was made")
