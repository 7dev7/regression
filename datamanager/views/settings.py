from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import generic

from datamanager.models import Configuration


class SettingsView(LoginRequiredMixin, generic.TemplateView):
    redirect_field_name = None
    template_name = 'settings.html'

    def get_context_data(self, **kwargs):
        data = super().get_context_data(**kwargs)
        user = self.request.user
        data['settings'] = Configuration.objects.get(owner=user)
        return data
