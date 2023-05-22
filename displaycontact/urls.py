from django.urls import path
from . import views

app_name = 'displaycontact'

urlpatterns = [
    path('', views.disp, name='contact'),
]
