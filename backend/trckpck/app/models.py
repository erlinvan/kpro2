import boto3
from boto3.dynamodb.conditions import Key
from django.db import models
from django.conf import settings


class Package(models.Model):
    COMPANY_CHOICES = (
        ('apple', 'Apple'),
        ('komplett', 'Komplett'),
        ('fjellsport', 'Fjellsport'),
        ('dressmann', 'Dressmann'),
        ('asus', 'Asus')
    )
    company_owner = models.CharField(max_length=200,
                                     choices=COMPANY_CHOICES)
    tracker_id = models.CharField(max_length=200)

    def get_package_data(self):
        """Retrieves all records for tracker with id=id"""
        dynamodb = boto3.resource('dynamodb', region_name='eu-west-1')
        table = dynamodb.Table(settings.DATA_TABLE)
        response = table.scan(
            FilterExpression=Key(settings.DATA_TABLE_TRACKER_ID).eq(self.tracker_id)
        )
        items = response.get('Items', [])
        return items


class Beacon(models.Model):
    id = models.CharField(max_length=200, primary_key=True)
    description = models.CharField(max_length=200)

