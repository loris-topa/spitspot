"""
This module provides a class that allows to find all intermediate points between two a and b points.
"""
class LineIndexFinder:
    def __init__(self, a_str, b_str):
        a = list(map(int, a_str.split("_")[1:3]))
        b = list(map(int, b_str.split("_")[1:3]))
        self.a = a
        self.b = b
        x_increment = b[0] - a[0]
        y_increment = b[1] - a[1]
        slope = 1
        if x_increment != 0:
            slope = y_increment / x_increment
        if -1 < slope < 1:
            k_key = "y"
            items = x_increment
            step = slope
        else:
            k_key = "x"
            items = y_increment
            step = 1 / slope

        # noinspection PyDictCreation
        self.next_indexes = {
            "x": range(0, items, 1 if items > 0 else -1),
            "y": range(0, items, 1 if items > 0 else -1),
        }
        self.next_indexes[k_key] = [point * step for point in range(0, items, 1 if items > 0 else -1)]

    def getNth(self, n):
        if len(self.next_indexes['x']) <= n:
            return None
        x = int(round(self.next_indexes["x"][n]))
        y = int(round(self.next_indexes["y"][n]))
        return "index_%d_%d" % (self.a[0] + x, self.a[1] + y)
