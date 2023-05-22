from django.urls import path
from .views import regEmp

app_name = 'emp'
urlpatterns = [
    path('regnewemp/', regEmp, name='regnewemp'),
]
