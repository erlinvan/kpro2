from random import uniform
from decimal import Decimal

trondheim = {'lat_range': (63.4371, 63.3986),
             'long_rang': (10.3665, 10.4162)}

lat = uniform(*trondheim['lat_range'])
lon = uniform(*trondheim['long_rang'])

def get_nmea_latlong_string(latitude, longitude):
    """ Returns the nmea gpgga format of latitude and longitude """
    lat_direction = 'N' if latitude > 0 else 'S'
    lat_ll = int(abs(latitude))
    lat_rest = (abs(latitude) % 1) * 60
    lat = '%02i%02.5f' % (lat_ll, lat_rest)

    long_direction = 'E' if longitude > 0 else 'W'
    long_ll = int(abs(longitude))
    long_llll = (abs(longitude) % 1) * 60
    long = '%03i%02.5f' % (long_ll, long_llll)

    return f"$GPGGA,NOT_USED,{lat},{lat_direction},{long},{long_direction},REST_NOT_USED"

print(nmea := get_nmea_latlong_string(lat, lon))
