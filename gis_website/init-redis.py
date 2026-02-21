#!/usr/bin/env python3
import redis
from geotiff import GeoTiff


r = redis.Redis(host='redis', port=6379, decode_responses=True)
r.flushall()

area_box = [(7.240751492511434, 45.03866075674466), (7.296083625171539, 45.01690297425946)]
img = GeoTiff('source.tif', crs_code=32632, as_crs=4326)
bounding_box = img.read_box(area_box)
((start_x, start_y), (end_x, end_y)) = img.get_int_box(area_box)
x, y = img.tif_shape
data = img.read()

for i in range(start_x, end_x + 1):
    print("\r%7d/%7d" % (i - start_x, end_x - start_x), end="")
    coords = tuple()
    altitudes = dict()
    for j in range(start_y, end_y + 1):
        coords = coords + img.get_wgs_84_coords(i + 1, j + 1) + ("index_%s_%s" % (i, j),)
        altitudes["index_%s_%s" % (i, j)] = float(data[i][j])
    r.geoadd("locations", coords)
    r.zadd("altitudes", altitudes)




