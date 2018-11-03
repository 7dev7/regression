from django.urls import path

from main.views import home

urlpatterns = [
    path('', home.HomeView.as_view(), name='home')
]
