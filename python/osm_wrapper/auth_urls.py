from django.urls import path

from . import auth_views

urlpatterns = [
    path("", auth_views.index, name="index"),
    path("challenge", auth_views.challenge, name="challenge"),
    path("register", auth_views.register, name="register"),
    path("register-do", auth_views.register_do, name="register_do"),
    path("login", auth_views.login_r, name="login"), # avoid shadowing of django's login
    path("login-do", auth_views.login_do, name="login_do"),

]