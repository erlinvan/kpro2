from django.core.management.base import BaseCommand, CommandError
from trckpck.app.models import Package, Company, AppUser

class Command(BaseCommand):
    help = 'Fills the database with some dummy data'

    def handle(self, *args, **options):
        try:
            # Create users
            AppUser.objects.create(
                username='superuser',
                is_superuser=True
            )
            user = AppUser.objects.create(
                username='user',
            )

            # Create companies
            apple = Company.objects.create(
                company_name='apple'
            )
            komplett = Company.objects.create(
                company_name='komplett'
            )
            fjellsport = Company.objects.create(
                company_name='fjellsport'
            )

            # Create packages
            Package.objects.create(
                company_owner=apple,
                tracker_id='test'
            )
            for i in range(12):
                Package.objects.create(
                    company_owner=apple,
                    tracker_id=f'dummy_apple{i}'
                )

            for i in range(7):
                Package.objects.create(
                    company_owner=komplett,
                    tracker_id=f'dummy_komplett{i}'
                )

            for i in range(5):
                Package.objects.create(
                    company_owner=fjellsport,
                    tracker_id=f'dummy_fjellsport{i}'
                )

            # Add permissions
            apple.appuser_set.add(user)
            fjellsport.appuser_set.add(user)

        except Exception:
            raise Exception("Something went wrong. Most likely this command has already been run and  the packages are in the database")

        print("Many packages was made")
