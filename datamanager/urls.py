from django.urls import path

from datamanager.views import load, my_data, dataset, analysis, models, model, column, auto_analysis, settings, \
    manual_analysis
from datamanager.views.rest import dataset_rest, analysis_rest, ml_models_rest, columns_rest

urlpatterns = [
    path('api/dataset/<int:data_id>/', dataset_rest.dataset_detail, name='dataset_rest'),

    path('api/dataset/<int:data_id>/nan/remove/', dataset_rest.remove_nan, name='remove_nan'),

    path('api/dataset/<int:data_id>/rename/', dataset_rest.rename_dataset, name='rename_dataset'),

    path('api/dataset/<int:data_id>/row/edit/', dataset_rest.edit_row, name='edit_row'),

    path('api/dataset/<int:data_id>/row/add/', dataset_rest.add_row, name='add_row'),

    path('api/dataset/<int:data_id>/row/remove/', dataset_rest.remove_row, name='remove_row'),

    path('api/dataset/<int:data_id>/column/remove/', dataset_rest.remove_column, name='remove_column'),

    path('api/dataset/<int:data_id>/column/rename/', dataset_rest.rename_column, name='rename_column'),

    path('api/dataset/analysis/', dataset_rest.analysis, name='dataset analysis'),

    path('api/analysis/', analysis_rest.linear_regression_scatter,
         name='analysis_linear_regr_rest'),

    path('api/analysis/info/', analysis_rest.linear_regression_info,
         name='analysis_linear_regr_info_rest'),

    path('api/analysis/info/nonlinear/', analysis_rest.polynomial_regression_scatter,
         name='analysis_nonlinear_regr_rest'),

    path('api/analysis/info/nonlinear/info/', analysis_rest.poly_regression_info,
         name='analysis_nonlinear_regr_info_rest'),

    path('api/analysis/info/neural/', analysis_rest.neural_regression_scatter,
         name='analysis_neural_regr_scatter_rest'),

    path('api/analysis/info/neural/info/', analysis_rest.neural_regression_info,
         name='analysis_neural_regr_info_rest'),

    path('api/analysis/info/forest/', analysis_rest.forest_regression_scatter,
         name='analysis_forest_regression_scatter_rest'),

    path('api/analysis/info/forest/info/', analysis_rest.forest_regression_info,
         name='analysis_forest_regression_info_rest'),

    path('api/analysis/predict/', analysis_rest.predict,
         name='analysis_predict'),

    path('api/analysis/auto/', analysis_rest.auto_analysis,
         name='auto_analysis'),

    path('api/models/', ml_models_rest.save_model, name='models_save'),

    path('api/columns/', columns_rest.column_info, name='column_info'),

    path('load/', load.LoadView.as_view(), name='load'),

    path('dataset/<int:data_id>/', dataset.DatasetView.as_view(), name='dataset'),

    path('analysis/<int:data_id>/', analysis.AnalysisView.as_view(), name='analysis'),

    path('analysis/auto/', auto_analysis.AutoAnalysisView.as_view(), name='auto analysis'),

    path('analysis/manual/', manual_analysis.ManualAnalysisView.as_view(), name='manual analysis'),

    path('models/', models.ModelsView.as_view(), name='models'),

    path('model/<int:model_id>/', model.ModelView.as_view(), name='model'),

    path('columns/dataset/<int:dataset_id>/', column.ColumnView.as_view(), name='column'),

    path('settings/', settings.SettingsView.as_view(), name='settings'),

    path('', my_data.DatasetView.as_view(), name='my_data'),
]
