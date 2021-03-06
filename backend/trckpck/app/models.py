""" Models """
import boto3
from boto3.dynamodb.conditions import Key
from django.db import models
from django.conf import settings


class Company(models.Model):
    """ Company model """
    company_name = models.CharField(max_length=200, primary_key=True)

    def __str__(self):
        return str(self.company_name)


class Package(models.Model):
    """ Package model  """
    company_owner = models.ForeignKey(Company, on_delete=models.CASCADE)
    tracker_id = models.CharField(max_length=200)

    class Meta:
        """" Unique """
        unique_together = ('company_owner', 'tracker_id')

    def get_package_data(self):
        """Retrieves all records for tracker with id=id"""
        dynamodb = boto3.resource('dynamodb', region_name='eu-west-1')
        table = dynamodb.Table(settings.DATA_TABLE)
        response = table.query(
            ScanIndexForward=True,
            KeyConditionExpression=Key(
                settings.DATA_TABLE_TRACKER_ID).eq(self.tracker_id)
        )
        items = response.get('Items', [])
        payload_list = []

        for item in items:
            timestamp = item['db_timestamp'].replace('T', ' ')
            timestamp = timestamp[:timestamp.rfind('.')]
            payload = {
                "id": self.tracker_id,
                "time_stamp": timestamp,
                "gps": item['reported']['GPS'],
                "company_owner": self.company_owner.company_name
            }

            if 'beacon_data' in item['reported']:
                self.add_beacon_description(item['reported']['beacon_data'])
                self.add_beacon_gps(item['reported']['beacon_data'])
                self.format_beacon_values(item['reported']['beacon_data'])
                item['reported']['beacon_data'].sort(
                    key=lambda b: b['timestamp'], reverse=False)
                payload['beacon_data'] = item['reported']['beacon_data']
            else:
                payload['beacon_data'] = []

            payload_list.append(payload)
        return payload_list

    def format_beacon_values(self, beacon_data):
        """ Format beacon values """
        for beacon in beacon_data:
            beacon["temperature"] = float(beacon['temperature'])
            beacon["humidity"] = float(beacon['humidity'])
            timestamp = beacon['timestamp']
            if 'T' in timestamp:
                timestamp = timestamp.replace('T', ' ')
            timestamp = timestamp[:timestamp.rfind('.')]
            beacon['timestamp'] = timestamp

    def add_beacon_gps(self, beacon_data):
        """ Add gps data to beacons """
        for beacon in beacon_data:
            try:
                beacon_latitude = Beacon.objects.get(
                    id=beacon['beacon_id']).latitude
                beacon_longitude = Beacon.objects.get(
                    id=beacon['beacon_id']).longitude
                if beacon_latitude and beacon_longitude:
                    beacon['latitude'] = beacon_latitude
                    beacon['longitude'] = beacon_longitude
            except Beacon.DoesNotExist:
                pass

    def add_beacon_description(self, beacon_data):
        """ Add description to beacons """
        for beacon in beacon_data:
            beacon_description = ''
            try:
                beacon_description = Beacon.objects.get(
                    id=beacon['beacon_id']).description
            except Beacon.DoesNotExist:
                pass
            beacon["description"] = beacon_description

    def get_latest_timestamp_and_position(self):
        """Retrieves the timestamp and gps position of the most recent record"""
        dynamodb = boto3.resource('dynamodb', region_name='eu-west-1')
        table = dynamodb.Table(settings.DATA_TABLE)
        response = table.query(
            ScanIndexForward=False,
            Limit=1,
            ProjectionExpression="db_timestamp, reported.GPS",
            ReturnConsumedCapacity="INDEXES",
            KeyConditionExpression=Key(
                settings.DATA_TABLE_TRACKER_ID).eq(self.tracker_id)
        )
        items = response.get('Items', [])
        if len(items) > 0:
            timestamp = items[0]['db_timestamp'].replace('T', ' ')
            timestamp = timestamp[:timestamp.rfind('.')]
            return timestamp, items[0]['reported']['GPS']
        return None, None

    def __str__(self):
        """ ToString method """
        return str(self.company_owner.company_name + ' ➝ ' + self.tracker_id)


class Beacon(models.Model):
    """ This model will be relevant later when we add descriptions to beacons """
    id = models.CharField(max_length=200, primary_key=True)
    description = models.CharField(max_length=200)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, blank=True, null=True)

    def __str__(self):
        return 'beacon ' + self.id


class AppUser(models.Model):
    """ User model """
    username = models.CharField(max_length=200, primary_key=True)
    permissions = models.ManyToManyField(Company, blank=True)
    is_superuser = models.BooleanField(default=False)

    def __str__(self):
        """ ToString method """
        return str(self.username)
