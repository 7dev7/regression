from django.urls import path

from datamanager.views import load, my_data

urlpatterns = [
    path('load/', load.LoadView.as_view(), name='load'),
    path('', my_data.DocumentsView.as_view(), name='my_data'),
]
