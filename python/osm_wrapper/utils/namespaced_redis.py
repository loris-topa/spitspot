"""
This class was an attempt at user-namespacing keys in Redis,
in order to allow every registered user to have a personal workspace.
It actually shortcircuits back at the original redis class.
@todo make it work MAYBE
"""
import logging

import redis
from django.contrib.auth.models import User

def redis_client(user: User):
    #r = NamespacedRedis(host='redis', port=6379, decode_responses=True)
    #r.set_prefix(user.username)
    r = redis.Redis(host='redis', port=6379, decode_responses=True)

    return r

class NamespacedRedis(redis.Redis):
    prefix = ""
    def set_prefix(self, prefix):
        self.prefix = prefix
    def execute_command(self, *args, **options):
        args_as_list = list(args)
        if len(args) > 1:
            args_as_list[1] = "%s:%s" % (self.prefix, args[1])
        return super().execute_command(*tuple(args_as_list), **options)
