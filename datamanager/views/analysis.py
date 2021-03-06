from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import generic


class AnalysisView(LoginRequiredMixin, generic.TemplateView):
    redirect_field_name = None
    template_name = 'analysis.html'

    def get_context_data(self, **kwargs):
        data = super().get_context_data(**kwargs)
        data['data_id'] = kwargs.get('data_id')
        return data
