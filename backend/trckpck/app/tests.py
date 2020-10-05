from django.test import TestCase, Client
from django.urls import reverse
from unittest.mock import patch

from trckpck.app.models import Package
import json


class PackageTest(TestCase):

    def setUp(self):
        self.client = Client()
        for i in range(6):
            Package.objects.create(company_owner='apple', tracker_id=str(i))
        for i in range(4):
            Package.objects.create(company_owner='komplett', tracker_id=str(i+10))

    def dummy_data(self):
        return 'test'


    @patch.object(Package, 'get_package_data', dummy_data)
    def get_packages_data_by_company_id(self):
        res = self.client.get(reverse('get_packages_data_by_company_id', args=['apple']), format='JSON')
        self.assertEqual(len(json.loads(res.content)), 6)

    @patch.object(Package, 'get_package_data', dummy_data)
    @patch.object(Package, 'get_latest_timestamp', dummy_data)
    def test_get_tracker_data_no_q(self):
        """ Make sure that tracker_data returns 200"""
        res = self.client.get(reverse('tracker_data'), format='JSON')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(json.loads(res.content)), 10)

    @patch.object(Package, 'get_package_data', dummy_data)
    @patch.object(Package, 'get_latest_timestamp', dummy_data)
    def test_get_tracker_data_id_q(self):
        """ Make sure that tracker_data returns 200 when given a existing pkg"""
        pkg = Package.objects.get(pk=1)
        res = self.client.get(reverse('tracker_data')+"?id=1", format='JSON')
        self.assertEqual(res.status_code, 200)

    @patch.object(Package, 'get_package_data', dummy_data)
    @patch.object(Package, 'get_latest_timestamp', dummy_data)
    def test_get_tracker_data_id_q_404(self):
        """ Make sure that tracker_data returns 200 when given a existing pkg"""
        res = self.client.get(reverse('tracker_data')+"?id=9000", format='JSON')
        self.assertEqual(res.status_code, 404)

    @patch.object(Package, 'get_package_data', dummy_data)
    @patch.object(Package, 'get_latest_timestamp', dummy_data)
    def test_get_tracker_data_company_q(self):
        """ Make sure that tracker_data returns 200 when given a existing pkg"""
        res = self.client.get(reverse('tracker_data')+"?company=apple", format='JSON')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(json.loads(res.content)), 6)
