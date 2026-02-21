from django import template
from django.contrib.auth.models import AnonymousUser
from gis_website.settings import DEBUG
from random import randint
import os

register = template.Library()

def is_logged(value):
    return isinstance(value, AnonymousUser) is False

def cb(value):
    buster = randint(1, 10000000) if DEBUG else os.environ['gis_version']
    return "%s?cb=%s" % (value, buster)

register.filter("is_logged", is_logged)
register.filter("cb", cb)