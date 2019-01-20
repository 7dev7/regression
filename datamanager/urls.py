from django.urls import path

from datamanager.views import load, my_data, dataset
from datamanager.views.rest import dataset_rest

urlpatterns = [
    path('load/', load.LoadView.as_view(), name='load'),
    path('dataset/<int:data_id>/', dataset.DatasetView.as_view(), name='dataset'),
    path('api/dataset/<int:data_id>/', dataset_rest.dataset_detail, name='dataset_rest'),
    path('', my_data.DatasetView.as_view(), name='my_data'),
]
