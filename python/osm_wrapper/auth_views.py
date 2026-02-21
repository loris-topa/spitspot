from django.shortcuts import render
from django.contrib.auth.models import User, AnonymousUser
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.decorators import permission_required
from django.views.decorators.http import require_POST
from django.shortcuts import redirect
from django.contrib.auth import authenticate, login
from django.template import RequestContext
from django.http import JsonResponse

from osm_wrapper.utils.challenge_issuer import create_challenge
from osm_wrapper.validators.validators import validate_challenge, validate_shape, validate_eq


def not_found(request, exception):
    return render(request, "osm_wrapper/404.html", RequestContext(request).push({
        "title": "404 - Not Found"
    }))

def index(request):
    return render(request, "osm_wrapper/index.html", RequestContext(request).push({
        "title": "My lil demo"
    }))

def register(request):
    if not isinstance(request.user, AnonymousUser):
        return redirect('/map')
    return render(request, "osm_wrapper/register.html", {
        "title": "Registrati"
    })

@require_POST
def register_do(request):
    shp = {
        'username': None,
        'password': None,
        'password_repeat': None,
        'challenge_id': None,
        'challenge_result': None,
    }
    validate_shape(request.POST, shp)
    validate_challenge(request.POST["challenge_id"], request.POST["challenge_result"])
    validate_eq(request.POST["password"], request.POST["password_repeat"])
    validate_password(request.POST["password"])

    User.objects.create_user(request.POST["username"], "example@example.org", request.POST["password"])
    user = authenticate(request, username=request.POST["username"], password=request.POST["password"])
    login(request, user)
    return redirect("/map")

def login_r(request):
    return render(request, "osm_wrapper/login.html", {
        "title": "Login"
    })

@require_POST
def login_do(request):
    shp = {
        'username': None,
        'password': None,
        'challenge_id': None,
        'challenge_result': None,
    }
    validate_shape(request.POST, shp)
    validate_challenge(request.POST["challenge_id"], request.POST["challenge_result"])

    username = request.POST["username"]
    password = request.POST["password"]
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return redirect('/map')
    return redirect('/login')

def challenge(request):
    # @todo this will end in some config/env
    KEY_SIZE = 7
    STATE_SIZE = 7
    SIMPLICITY_FACTOR = 4
    SMALL_ITERS = 50
    BIG_ITERS = 300
    response = create_challenge(KEY_SIZE, STATE_SIZE, SIMPLICITY_FACTOR, SMALL_ITERS, BIG_ITERS)
    return JsonResponse(response)

