from django.urls import path

from datamanager.views import load, my_data, dataset, analysis, models, model, column
from datamanager.views.rest import dataset_rest, analysis_rest, ml_models_rest, columns_rest

urlpatterns = [
    path('api/dataset/<int:data_id>/', dataset_rest.dataset_detail, name='dataset_rest'),

    path('api/analysis/', analysis_rest.linear_regression_scatter,
         name='analysis_linear_regr_rest'),

    path('api/analysis/info/', analysis_rest.linear_regression_info,
         name='analysis_linear_regr_info_rest'),

    path('api/analysis/info/nonlinear/', analysis_rest.polynomial_regression_scatter,
         name='analysis_nonlinear_regr_rest'),

    path('api/analysis/info/nonlinear/info/', analysis_rest.poly_regression_info,
         name='analysis_nonlinear_regr_info_rest'),

    path('api/analysis/info/neural/', analysis_rest.neural_regression_scatter,
         name='analysis_neural_regr_info_rest'),

    path('api/analysis/predict/', analysis_rest.linear_predict,
         name='analysis_linear_predict'),

    path('api/models/', ml_models_rest.save_model, name='models_save'),

    path('api/columns/', columns_rest.column_info, name='column_info'),

    path('load/', load.LoadView.as_view(), name='load'),

    path('dataset/<int:data_id>/', dataset.DatasetView.as_view(), name='dataset'),

    path('analysis/<int:data_id>/', analysis.AnalysisView.as_view(), name='analysis'),

    path('models/', models.ModelsView.as_view(), name='models'),

    path('model/<int:model_id>/', model.ModelView.as_view(), name='model'),

    path('columns/dataset/<int:dataset_id>/', column.ColumnView.as_view(), name='column'),

    path('', my_data.DatasetView.as_view(), name='my_data'),
]
