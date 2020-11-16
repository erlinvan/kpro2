from django.core.management.base import BaseCommand, CommandError
from trckpck.app.models import Package, Company, AppUser, Beacon


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
            appleuser = AppUser.objects.create(
                username='appleUser'
            )
            komplettuser = AppUser.objects.create(
                username='komplettUser'
            )
            fjellsportuser = AppUser.objects.create(
                username='fjellsportUser'
            )
            glashareuser = AppUser.objects.create(
                username='Tim'
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
            glashare = Company.objects.create(
                company_name='Gla-share'
            )

            # Create packages
            Package.objects.create(
                company_owner=apple,
                tracker_id='test'
            )
            for i in range(13):
                Package.objects.create(
                    company_owner=apple,
                    tracker_id=f'dummy_apple{i}'
                )

            for i in range(8):
                Package.objects.create(
                    company_owner=komplett,
                    tracker_id=f'dummy_komplett{i}'
                )

            for i in range(5):
                Package.objects.create(
                    company_owner=fjellsport,
                    tracker_id=f'dummy_fjellsport{i}'
                )
            Package.objects.create(
                company_owner=glashare,
                tracker_id='NORBIT-tracker'
            )

            # Create beacons
            Beacon.objects.create(
                id='789',
                description='Beacon 789 description',
                latitude=63.422588,
                longitude=10.424960
            )
            Beacon.objects.create(
                id='25d3a43f23ac',
                description='description for 25d3a43f23ac',
                latitude=63.424102,
                longitude=10.394430
            )
            Beacon.objects.create(
                id='ac233fa4d325',
                description='description for ac233fa4d325',
                latitude=63.524102,
                longitude=10.294430
            )
            Beacon.objects.create(
                id='28d3a43f23ac',
                description='description for 28d3a43f23ac',
                latitude=63.417184,
                longitude=10.402352
            )

            # Add permissions
            apple.appuser_set.add(user)
            fjellsport.appuser_set.add(user)
            apple.appuser_set.add(appleuser)
            komplett.appuser_set.add(komplettuser)
            fjellsport.appuser_set.add(fjellsportuser)
            glashare.appuser_set.add(glashareuser)

        except Exception:
            raise Exception(
                "Something went wrong. Most likely this command has already been run and  the packages are in the database")

        print("Many packages was made")
