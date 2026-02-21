def key_setter(key, fn):
    def clos(item):
        item[key] = fn(item)
        return item
    return clos