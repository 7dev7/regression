from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import generic

from datamanager.models import Dataset


class ColumnView(LoginRequiredMixin, generic.TemplateView):
    redirect_field_name = None
    template_name = 'column.html'

    def get_context_data(self, **kwargs):
        data = super().get_context_data(**kwargs)
        dataset = Dataset.objects.get(pk=kwargs.get('dataset_id'))
        data['columns'] = dataset.columns
        data['name'] = dataset.name
        data['ds_id'] = dataset.id
        return data
