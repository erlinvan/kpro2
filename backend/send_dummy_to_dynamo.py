import boto3
import uuid
from decimal import Decimal
from random import randint, uniform
from datetime import datetime, timedelta
from pprint import pprint


dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('test_table')

oslo = {'lat_range': (59.87322, 59.84012),
        'long_rang': (10.72458, 10.79055)}

trondheim = {'lat_range': (63.4371, 63.3986),
        'long_rang': (10.3665, 10.4162)}


rand_60 = lambda: randint(0, 60)
rand_24 = lambda: randint(0, 24)


def random_date():
   now = datetime.now()
   rand_delta = timedelta(
      days=randint(-2, 2),
      seconds=rand_60(),
      minutes=rand_60(),
      hours=rand_24(),
      weeks=randint(0, 1)
   )
   return now + rand_delta


def generate_random_data_point(beacon_id, city, thing_name):
   rand_date = str(random_date()).replace(" ", "T")
   lat = uniform(*city['lat_range'])
   lon = uniform(*city['long_rang'])
   pk = str(uuid.uuid4())
   item = {
      "db_timestamp": rand_date,
      "reported": {
         "temperature": Decimal("23"),
         "battery_voltage": Decimal("3918"),
         "battery_percentage": Decimal("76"),
         "GPS": {
            "lat": Decimal(f"{lat}"),
            "lon": Decimal(f"{lon}")
         },
         "signal_strength": Decimal("-88"),
         "beacon_data": [
            {
               "temperature": randint(15, 30),
               "humidity": randint(25, 55),
               "beacon_id": beacon_id,
               "timestamp": rand_date
            }
         ]
      },
      "pk": pk,
      "thing_name": thing_name
   }
   return item

item = generate_random_data_point("789", oslo, "dummy")
s=table.put_item(
    Item=item
)
print(s)
