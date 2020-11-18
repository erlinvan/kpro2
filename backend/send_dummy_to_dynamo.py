import boto3
import uuid
from decimal import Decimal
from random import randint, uniform
from datetime import datetime, timedelta
from pprint import pprint

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('trckpck')

oslo = {'lat_range': (59.87322, 59.84012),
        'long_rang': (10.72458, 10.79055)}

trondheim = {'lat_range': (63.4371, 63.3986),
             'long_rang': (10.3665, 10.4162)}

bergen = {'lat_range': (60.4626, 60.3098),
          'long_rang': (5.0671, 5.6061)}

bergen_oslo = {'lat_range': (60.3093, 59.6906),
               'long_rang': (6.9887, 9.1447)}


bergen_trondheim = {'lat_range': (62.7107, 62.1379),
                    'long_rang': (7.0367, 9.1928)}


oslo_trondheim = {'lat_range': (62.538, 60.347),
                  'long_rang': (9.261, 11.305)}

trondheim_moirana = {'lat_range': (65.599, 63.425),
                     'long_rang': (10.547, 13.722)}

moirana_bodo = {'lat_range': (67.285, 65.435),
                'long_rang': (12.491, 15.469)}


def rand_60(): return randint(0, 60)
def rand_24(): return randint(0, 24)


def random_date(later_than=None):
    now = later_than or datetime.now()
    rand_delta = timedelta(
        days=randint(0, 2),
        seconds=rand_60(),
        minutes=rand_60(),
        hours=rand_24(),
        weeks=randint(0, 1)
    )
    return now + rand_delta


def generate_random_beacon_data(beacon_id: int, date):
    data_list = []
    for i in range(randint(1, 4)):
        data_list.append({
            "temperature": randint(15, 30),
            "humidity": randint(25, 55),
            "beacon_id": str(beacon_id + i),
            "timestamp": str(date + timedelta(hours=i)).replace(" ", "T")
        })
    return data_list


def generate_random_data_point(beacon_id, city, thing_name, init_date):
    rand_date = random_date(later_than=init_date)
    lat = uniform(*city['lat_range'])
    lon = uniform(*city['long_rang'])
    item = {
        "db_timestamp": str(rand_date).replace(" ", "T"),
        "reported": {
            "temperature": Decimal("23"),
            "battery_voltage": Decimal("3918"),
            "battery_percentage": Decimal("76"),
            "GPS": {
                "lat": Decimal(f"{lat}"),
                "lon": Decimal(f"{lon}")
            },
            "signal_strength": Decimal("-88"),
            "beacon_data": generate_random_beacon_data(beacon_id, rand_date)
        },
        "thing_name": thing_name
    }
    return item, rand_date


def random_trip():
    trips = [
        [oslo, oslo_trondheim, trondheim],
        [trondheim, oslo_trondheim, oslo],
        [bergen, bergen_oslo, oslo],
        [oslo, oslo_trondheim, trondheim_moirana, moirana_bodo],
        [moirana_bodo, trondheim_moirana, bergen_trondheim],
        [moirana_bodo, trondheim_moirana, oslo_trondheim, oslo],
        [bergen, bergen_oslo, oslo, oslo_trondheim, trondheim]
    ]
    return trips[randint(0,len(trips)-1)]


def generate_random_trips_for_thing(thing_name, cities, init_date):
    items = []
    for city in cities:
        for _ in range(2):
            item, init_date = generate_random_data_point(
                randint(0, 1000), city, thing_name, init_date)
            items.append(item)
    return items


items = []
init_date = datetime.now() + timedelta(days=-80)
for thing_name in ['dummy_apple'+str(i) for i in range(13)]:
    items.extend(generate_random_trips_for_thing(
        thing_name, random_trip(), init_date))

for thing_name in ['dummy_komplett'+str(i) for i in range(8)]:
    items.extend(generate_random_trips_for_thing(
        thing_name, random_trip(), init_date))

for thing_name in ['dummy_fjellsport'+str(i) for i in range(5)]:
    items.extend(generate_random_trips_for_thing(
        thing_name, random_trip(), init_date))


print("Number of items", len(items))
for item in items:
    s = table.put_item(
        Item=item
  )
