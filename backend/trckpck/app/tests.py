from django.test import TestCase, Client
from django.urls import reverse
from unittest.mock import patch
from trckpck.app.models import Package, Company, AppUser
import json


class PackageTest(TestCase):

    def setUp(self):
        self.client = Client(HTTP_X_username='random_user')
        apple = Company.objects.create(company_name='apple')
        komplett = Company.objects.create(company_name='komplett')
        asus = Company.objects.create(company_name='asus')
        for i in range(6):
            Package.objects.create(company_owner=apple, tracker_id=str(i))
        for i in range(4):
            Package.objects.create(company_owner=komplett, tracker_id=str(i+10))
        AppUser.objects.create(username='superuser', is_superuser=True)
        user = AppUser.objects.create(username='random_user', is_superuser=False)
        apple.appuser_set.add(user)
        asus.appuser_set.add(user)

    def dummy_data(self):
        return 'test'

    def dummy_data_timestamp_and_position(self):
        return 'some_timestamp', 'some position'

    @patch.object(Package, 'get_package_data', dummy_data)
    def get_packages_data_by_company_id(self):
        res = self.client.get(reverse('get_packages_data_by_company_id', args=['apple']), format='JSON', HTTP_X_username='superuser')
        self.assertEqual(len(json.loads(res.content)), 6)

    @patch.object(Package, 'get_package_data', dummy_data)
    @patch.object(Package, 'get_latest_timestamp_and_position', dummy_data_timestamp_and_position)
    def test_get_tracker_data_no_q(self):
        """ Make sure that tracker_data returns 200"""
        res = self.client.get(reverse('tracker_data'), format='JSON', HTTP_X_username='superuser')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(json.loads(res.content)), 10)

    @patch.object(Package, 'get_package_data', dummy_data)
    @patch.object(Package, 'get_latest_timestamp_and_position', dummy_data_timestamp_and_position)
    def test_get_tracker_data_id_q(self):
        """ Make sure that tracker_data returns 200 when given a existing pkg"""
        pkg = Package.objects.get(pk=1)
        res = self.client.get(reverse('tracker_data')+"?id=1", format='JSON', HTTP_X_username='superuser')
        self.assertEqual(res.status_code, 200)

    @patch.object(Package, 'get_package_data', dummy_data)
    @patch.object(Package, 'get_latest_timestamp_and_position', dummy_data_timestamp_and_position)
    def test_get_tracker_data_id_q_404(self):
        """ Make sure that tracker_data returns 200 when given a existing pkg"""
        res = self.client.get(reverse('tracker_data')+"?id=9000", format='JSON', HTTP_X_username='superuser')
        self.assertEqual(res.status_code, 404)

    @patch.object(Package, 'get_package_data', dummy_data)
    @patch.object(Package, 'get_latest_timestamp_and_position', dummy_data_timestamp_and_position)
    def test_get_tracker_data_company_q(self):
        """ Make sure that tracker_data returns 200 when given a existing pkg"""
        res = self.client.get(reverse('tracker_data')+"?company=apple", format='JSON', HTTP_X_username='superuser')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(json.loads(res.content)), 6)

    @patch.object(Package, 'get_package_data', dummy_data)
    @patch.object(Package, 'get_latest_timestamp_and_position', dummy_data_timestamp_and_position)
    def test_superuser_authorization(self):
        """ Make sure that superusers are authorized to do anything """
        response1 = self.client.get(reverse('tracker_data'), format='JSON', HTTP_X_username='superuser')
        response2 = self.client.get(reverse('tracker_data')+"?company=apple", format='JSON', HTTP_X_username='superuser')
        response3 = self.client.get(reverse('tracker_data')+"?id=1", format='JSON', HTTP_X_username='superuser')
        self.assertEqual(response1.status_code, 200)
        self.assertEqual(response2.status_code, 200)
        self.assertEqual(response3.status_code, 200)

    @patch.object(Package, 'get_package_data', dummy_data)
    @patch.object(Package, 'get_latest_timestamp_and_position', dummy_data_timestamp_and_position)
    def test_not_authorized(self):
        """ Make sure that unauthorized users cannot do anything """
        response1 = self.client.get(reverse('tracker_data'), format='JSON', HTTP_X_username='user_without_permissions')
        response2 = self.client.get(reverse('tracker_data') + "?company=apple", format='JSON', HTTP_X_username='user_without_permissions')
        response3 = self.client.get(reverse('tracker_data') + "?id=1", format='JSON', HTTP_X_username='user_without_permissions')
        self.assertEqual(response1.status_code, 403)
        self.assertEqual(response2.status_code, 403)
        self.assertEqual(response3.status_code, 403)

    @patch.object(Package, 'get_package_data', dummy_data)
    @patch.object(Package, 'get_latest_timestamp_and_position', dummy_data_timestamp_and_position)
    def test_partly_authorized(self):
        """ Make sure that partly authorized users only can do some things """
        response1 = self.client.get(reverse('tracker_data'), format='JSON', HTTP_X_username='random_user')
        response2 = self.client.get(reverse('tracker_data') + "?company=apple", format='JSON', HTTP_X_username='random_user')
        response3 = self.client.get(reverse('tracker_data') + "?company=asus", format='JSON', HTTP_X_username='random_user')
        response4 = self.client.get(reverse('tracker_data') + "?company=komplett", format='JSON', HTTP_X_username='random_user')
        response5 = self.client.get(reverse('tracker_data') + "?id=1", format='JSON', HTTP_X_username='random_user')
        response6 = self.client.get(reverse('tracker_data') + "?id=7", format='JSON', HTTP_X_username='random_user')
        self.assertEqual(response1.status_code, 403)
        self.assertEqual(response2.status_code, 200)
        self.assertEqual(response3.status_code, 200)
        self.assertEqual(response4.status_code, 403)
        self.assertEqual(response5.status_code, 200)
        self.assertEqual(response6.status_code, 403)
