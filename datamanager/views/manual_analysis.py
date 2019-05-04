from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import generic

import datamanager.services.missing_values as miss_values
from datamanager.models import Dataset


class ManualAnalysisView(LoginRequiredMixin, generic.TemplateView):
    redirect_field_name = None
    template_name = 'manual_analysis.html'

    def get_context_data(self, **kwargs):
        data = super().get_context_data(**kwargs)
        datasets = Dataset.objects.filter(author=self.request.user).order_by('-upload_time')
        data['datasets'] = datasets

        nan_map = {}
        for ds in datasets:
            nan_columns = miss_values.get_nan_columns_for_ds(ds.id)
            nan_map[ds.id] = len(nan_columns) != 0

        data['nan_map'] = nan_map
        return data
