from django.urls import path

from datamanager.views import load, my_data, dataset, analysis, models, model
from datamanager.views.rest import dataset_rest, analysis_rest, ml_models_rest

urlpatterns = [
    path('load/', load.LoadView.as_view(), name='load'),
    path('dataset/<int:data_id>/', dataset.DatasetView.as_view(), name='dataset'),
    path('analysis/<int:data_id>/', analysis.AnalysisView.as_view(), name='analysis'),
    path('api/dataset/<int:data_id>/', dataset_rest.dataset_detail, name='dataset_rest'),
    path('api/analysis/', analysis_rest.linear_regression_scatter,
         name='analysis_linear_regr_rest'),
    path('api/analysis/info/', analysis_rest.linear_regression_info,
         name='analysis_linear_regr_info_rest'),
    path('api/analysis/info/nonlinear/', analysis_rest.polynomial_regression_scatter,
         name='analysis_nonlinear_regr_info_rest'),
    path('api/models/', ml_models_rest.save_model, name='models_save'),
    path('models/', models.ModelsView.as_view(), name='models'),
    path('model/<int:model_id>/', model.ModelView.as_view(), name='model'),
    path('', my_data.DatasetView.as_view(), name='my_data'),
]
