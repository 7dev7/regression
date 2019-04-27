from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import generic

from datamanager.models import MlModel
from datamanager.services.auto_analysis import func_mapping
from datamanager.services.dataframe import get_columns_meta


class ModelView(LoginRequiredMixin, generic.TemplateView):
    redirect_field_name = None
    template_name = 'model.html'

    def get_context_data(self, **kwargs):
        data = super().get_context_data(**kwargs)
        model = MlModel.objects.get(pk=kwargs.get('model_id'))
        data['model'] = model

        data['meta'] = get_columns_meta(model.dataset.id, model.ds_in_cols) + \
                       get_columns_meta(model.dataset.id, model.ds_out_cols)
        data['activation'] = func_mapping.get(model.activation, '')
        return data
