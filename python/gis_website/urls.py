"""
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("", include("osm_wrapper.urls")),
    path("", include("osm_wrapper.auth_urls")),
    path("admin/", admin.site.urls),
]
handler404 = "osm_wrapper.auth_views.not_found"
handler405 = "osm_wrapper.auth_views.not_found"
