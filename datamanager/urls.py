from django.urls import path

from datamanager.views import load, my_data, dataset, analysis
from datamanager.views.rest import dataset_rest, analysis_rest

urlpatterns = [
    path('load/', load.LoadView.as_view(), name='load'),
    path('dataset/<int:data_id>/', dataset.DatasetView.as_view(), name='dataset'),
    path('analysis/<int:data_id>/', analysis.AnalysisView.as_view(), name='analysis'),
    path('api/dataset/<int:data_id>/', dataset_rest.dataset_detail, name='dataset_rest'),
    path('api/analysis/<int:data_id>/<str:x>/<str:y>/', analysis_rest.linear_regression,
         name='analysis_linear_regr_rest'),
    path('api/analysis/info/<int:data_id>/<str:x>/<str:y>/', analysis_rest.linear_regression_info,
         name='analysis_linear_regr_info_rest'),
    path('', my_data.DatasetView.as_view(), name='my_data'),
]
