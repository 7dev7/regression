from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import generic

from datamanager.models import Dataset


class ManualAnalysisView(LoginRequiredMixin, generic.TemplateView):
    redirect_field_name = None
    template_name = 'manual_analysis.html'

    def get_context_data(self, **kwargs):
        data = super().get_context_data(**kwargs)
        data['datasets'] = Dataset.objects.filter(author=self.request.user)
        return data
