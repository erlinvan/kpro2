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

    class Meta:
        unique_together = ('company_owner', 'tracker_id')

    def get_package_data(self):
        """Retrieves all records for tracker with id=id"""
        dynamodb = boto3.resource('dynamodb', region_name='eu-west-1')
        table = dynamodb.Table(settings.DATA_TABLE)
        response = table.scan(
            FilterExpression=Key(settings.DATA_TABLE_TRACKER_ID).eq(self.tracker_id)
        )
        items = response.get('Items', [])
        return items

    def get_latest_timestamp(self):
        """Retrieves the timestamp of the most recent record"""
        dynamodb = boto3.resource('dynamodb', region_name='eu-west-1')
        table = dynamodb.Table(settings.DATA_TABLE)
        response = table.query(
            IndexName='thing_name-db_timestamp-index',
            ScanIndexForward=False,
            Limit=1,
            ProjectionExpression="db_timestamp",
            KeyConditionExpression=Key(settings.DATA_TABLE_TRACKER_ID).eq(self.tracker_id)
        )
        items = response.get('Items', [])
        return items[0]['db_timestamp']


class Beacon(models.Model):
    id = models.CharField(max_length=200, primary_key=True)
    description = models.CharField(max_length=200)

