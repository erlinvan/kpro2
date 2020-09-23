from django.test import TestCase, Client
from django.urls import reverse
from unittest.mock import patch

from trckpck.app.models import Package
import json


class PackageTest(TestCase):

    def setUp(self):
        self.client = Client()
        for i in range(6):
            Package.objects.create(company_owner='apple', tracker_id='123')
        for i in range(4):
            Package.objects.create(company_owner='komplett', tracker_id='111')

    def dummy_data(self):
        return 'test'

    @patch.object(Package, 'get_package_data', dummy_data)
    def test_package_dump(self):
        res = self.client.get(reverse('package_dump'), format='JSON')
        self.assertEqual(len(json.loads(res.content)), 10)

    @patch.object(Package, 'get_package_data', dummy_data)
    def test_get_packages_data_by_company_id(self):
        res = self.client.get(reverse('get_packages_data_by_company_id', args=['apple']), format='JSON')
        self.assertEqual(len(json.loads(res.content)), 6)

    @patch.object(Package, 'get_package_data', dummy_data)
    def test_get_package_data_by_package_id(self):
        id = Package.objects.all()[0].pk
        res = self.client.get(reverse('get_package_data_by_package_id', args=[id]), format='JSON')
        res2 = self.client.get(reverse('get_package_data_by_package_id', args=[9000]), format='JSON')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res2.status_code, 404)
