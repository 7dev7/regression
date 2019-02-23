from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import generic

from datamanager.models import MlModel


class ModelView(LoginRequiredMixin, generic.TemplateView):
    redirect_field_name = None
    template_name = 'model.html'

    def get_context_data(self, **kwargs):
        data = super().get_context_data(**kwargs)
        data['model'] = MlModel.objects.get(pk=kwargs.get('model_id'))
        return data
