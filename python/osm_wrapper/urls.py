from django.urls import path

from . import views

urlpatterns = [
    path("map", views.get_map, name="map"), # keep view function name different to avoid shadowing the "map" builtin
    path("box", views.get_box, name="box"),
    path("spots", views.get_spots, name="spots"),
    path("approach", views.get_approach, name="approach"),
    path("populate-spots", views.populate_spots, name="populate_spots"),
    path("populate-approach", views.populate_approach, name="populate_approach"),
    path("find-lines", views.find_lines, name="find_lines"),
    path("init", views.init, name="init"),
]