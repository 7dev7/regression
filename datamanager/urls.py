from django.urls import path

from datamanager.views import load

urlpatterns = [
    path('load/', load.LoadView.as_view(), name='load'),
]
