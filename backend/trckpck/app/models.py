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
        response = table.query(
            IndexName='thing_name-db_timestamp-index',
            ScanIndexForward=False,
            KeyConditionExpression=Key(settings.DATA_TABLE_TRACKER_ID).eq(self.tracker_id)
        )
        items = response.get('Items', [])
        payload_list = []

        for item in items:
            self.add_beacon_description(item['reported']['beacon_data'])
            self.format_beacon_values(item['reported']['beacon_data'])
            payload = {
                "id": self.tracker_id,
                "time_stamp": item['db_timestamp'],
                "gps": item['reported']['GPS'],
                "company_owner": self.company_owner,
                "beacon_data": item['reported']['beacon_data']
            }
            payload_list.append(payload)
        return payload_list

    def format_beacon_values(self, beacon_data):
        for b in beacon_data:
            b["temperature"] = float(b['temperature'])
            b["humidity"] = float(b['humidity'])

    def add_beacon_description(self, beacon_data):
        for b in beacon_data:
            beacon_description = ''
            try:
                beacon_description = Beacon.objects.get(id=b['beacon_id']).description
            except Beacon.DoesNotExist:
                pass
            b["description"] = beacon_description


    def get_latest_timestamp_and_position(self):
        """Retrieves the timestamp and gps position of the most recent record"""
        dynamodb = boto3.resource('dynamodb', region_name='eu-west-1')
        table = dynamodb.Table(settings.DATA_TABLE)
        response = table.query(
            IndexName='thing_name-db_timestamp-index',
            ScanIndexForward=False,
            Limit=1,
            ProjectionExpression="db_timestamp, reported.GPS",
            KeyConditionExpression=Key(settings.DATA_TABLE_TRACKER_ID).eq(self.tracker_id)
        )
        items = response.get('Items', [])
        return items[0]['db_timestamp'], items[0]['reported']['GPS']


class Beacon(models.Model):
    """ This model will be relevant later when we add descriptions to beacons """
    id = models.CharField(max_length=200, primary_key=True)
    description = models.CharField(max_length=200)

