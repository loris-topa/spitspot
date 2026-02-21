#!/usr/bin/env python3
import redis
import sys
DESIRED_SLOPE = 3
r = redis.Redis(host='redis', port=6379, decode_responses=True)
print('working on the peaks')
# @todo: query the locations set for the amount of keys in it, so we can divide that number by 10 for the zscan
for i in range(0, 11070):
    _, altitudes = r.zscan("altitudes", i)

    for index, altitude in altitudes:
        count = 0
        aggregated_slope = 0
        # that's lazy and slow, could access the keys of the 8 adjacent elements
        around = r.geosearch("locations", member=index, width=30, height=30, unit="m", withdist=True)
        for elem, distance in around:
            other_altitude = r.zscore("altitudes", elem)
            if other_altitude < altitude - (DESIRED_SLOPE * distance):
                count += 1
                aggregated_slope += (altitude - other_altitude) / distance
        if count > 1:
            print("found %d points (average slope: %s) on this peak: %s" % (count, aggregated_slope / count, r.geopos('locations', index),))