from django.urls import path

from datamanager.views import load, my_data, dataset

urlpatterns = [
    path('load/', load.LoadView.as_view(), name='load'),
    path('dataset/', dataset.DatasetView.as_view(), name='dataset'),
    path('', my_data.DatasetView.as_view(), name='my_data'),
]
