from django.test import TestCase, Client
from django.urls import reverse
from unittest.mock import patch

from trckpck.app.models import Package
import trckpck.app.decorators as decorators
import json


class PackageTest(TestCase):

    def setUp(self):
        self.client = Client(HTTP_X_username='random_user')
        for i in range(6):
            Package.objects.create(company_owner='apple', tracker_id=str(i))
        for i in range(4):
            Package.objects.create(company_owner='komplett', tracker_id=str(i+10))

    def dummy_data(self):
        return 'test'

    def dummy_data_timestamp_and_position(self):
        return 'some_timestamp', 'some position'

    @patch.object(Package, 'get_package_data', dummy_data)
    @patch.object(decorators, 'superusers', ['random_user'])
    @patch.object(decorators, 'permissions', {})
    def get_packages_data_by_company_id(self):
        res = self.client.get(reverse('get_packages_data_by_company_id', args=['apple']), format='JSON')
        self.assertEqual(len(json.loads(res.content)), 6)

    @patch.object(Package, 'get_package_data', dummy_data)
    @patch.object(Package, 'get_latest_timestamp_and_position', dummy_data_timestamp_and_position)
    @patch.object(decorators, 'superusers', ['random_user'])
    @patch.object(decorators, 'permissions', {})
    def test_get_tracker_data_no_q(self):
        """ Make sure that tracker_data returns 200"""
        res = self.client.get(reverse('tracker_data'), format='JSON')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(json.loads(res.content)), 10)

    @patch.object(Package, 'get_package_data', dummy_data)
    @patch.object(Package, 'get_latest_timestamp_and_position', dummy_data_timestamp_and_position)
    @patch.object(decorators, 'superusers', ['random_user'])
    @patch.object(decorators, 'permissions', {})
    def test_get_tracker_data_id_q(self):
        """ Make sure that tracker_data returns 200 when given a existing pkg"""
        pkg = Package.objects.get(pk=1)
        res = self.client.get(reverse('tracker_data')+"?id=1", format='JSON')
        self.assertEqual(res.status_code, 200)

    @patch.object(Package, 'get_package_data', dummy_data)
    @patch.object(Package, 'get_latest_timestamp_and_position', dummy_data_timestamp_and_position)
    @patch.object(decorators, 'superusers', ['random_user'])
    @patch.object(decorators, 'permissions', {})
    def test_get_tracker_data_id_q_404(self):
        """ Make sure that tracker_data returns 200 when given a existing pkg"""
        res = self.client.get(reverse('tracker_data')+"?id=9000", format='JSON')
        self.assertEqual(res.status_code, 404)

    @patch.object(Package, 'get_package_data', dummy_data)
    @patch.object(Package, 'get_latest_timestamp_and_position', dummy_data_timestamp_and_position)
    @patch.object(decorators, 'superusers', ['random_user'])
    @patch.object(decorators, 'permissions', {})
    def test_get_tracker_data_company_q(self):
        """ Make sure that tracker_data returns 200 when given a existing pkg"""
        res = self.client.get(reverse('tracker_data')+"?company=apple", format='JSON')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(json.loads(res.content)), 6)

    @patch.object(Package, 'get_package_data', dummy_data)
    @patch.object(Package, 'get_latest_timestamp_and_position', dummy_data_timestamp_and_position)
    @patch.object(decorators, 'superusers', ['random_user'])
    @patch.object(decorators, 'permissions', {})
    def test_superuser_authorization(self):
        """ Make sure that superusers are authorized to do anything """
        res = self.client.get(reverse('tracker_data'), format='JSON')
        self.assertEqual(res.status_code, 200)
        res = self.client.get(reverse('tracker_data')+"?company=apple", format='JSON')
        self.assertEqual(res.status_code, 200)
        res = self.client.get(reverse('tracker_data')+"?id=1", format='JSON')
        self.assertEqual(res.status_code, 200)

    @patch.object(Package, 'get_package_data', dummy_data)
    @patch.object(Package, 'get_latest_timestamp_and_position', dummy_data_timestamp_and_position)
    @patch.object(decorators, 'superusers', [])
    @patch.object(decorators, 'permissions', {'random_user': []})
    def test_not_authorized(self):
        """ Make sure that unauthorized users cannot do anything """
        res = self.client.get(reverse('tracker_data'), format='JSON')
        self.assertEqual(res.status_code, 403)
        res = self.client.get(reverse('tracker_data') + "?company=apple", format='JSON')
        self.assertEqual(res.status_code, 403)
        res = self.client.get(reverse('tracker_data') + "?id=1", format='JSON')
        self.assertEqual(res.status_code, 403)

    @patch.object(Package, 'get_package_data', dummy_data)
    @patch.object(Package, 'get_latest_timestamp_and_position', dummy_data_timestamp_and_position)
    @patch.object(decorators, 'superusers', [])
    @patch.object(decorators, 'permissions', {'random_user': ['apple', 'asus']})
    def test_partly_authorized(self):
        """ Make sure that partly authorized users only can do some things """
        res = self.client.get(reverse('tracker_data'), format='JSON')
        self.assertEqual(res.status_code, 403)
        res = self.client.get(reverse('tracker_data') + "?company=apple", format='JSON')
        self.assertEqual(res.status_code, 200)
        res = self.client.get(reverse('tracker_data') + "?company=asus", format='JSON')
        self.assertEqual(res.status_code, 200)
        res = self.client.get(reverse('tracker_data') + "?company=komplett", format='JSON')
        self.assertEqual(res.status_code, 403)
        res = self.client.get(reverse('tracker_data') + "?id=1", format='JSON')
        self.assertEqual(res.status_code, 200)
        res = self.client.get(reverse('tracker_data') + "?id=7", format='JSON')
        self.assertEqual(res.status_code, 403)
