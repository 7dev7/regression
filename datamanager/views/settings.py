from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect
from django.template.context_processors import csrf
from django.views import generic

import datamanager.services.config as cfg
from datamanager.models import Configuration


class SettingsView(LoginRequiredMixin, generic.TemplateView):
    redirect_field_name = None
    template_name = 'settings.html'

    def get_context_data(self, **kwargs):
        data = super().get_context_data(**kwargs)
        user = self.request.user
        data['settings'] = Configuration.objects.get(owner=user)
        return data

    @staticmethod
    def post(request):
        args = {}
        args.update(csrf(request))

        unique_values_threshold = request.POST.get('unique_values_threshold')
        nn_hidden_min = request.POST.get('nn_hidden_min')
        nn_hidden_max = request.POST.get('nn_hidden_max')
        poly_min = request.POST.get('poly_min')
        poly_max = request.POST.get('poly_max')

        cfg.update_config(request.user, unique_values_threshold=unique_values_threshold,
                          nn_hidden_min=nn_hidden_min,
                          nn_hidden_max=nn_hidden_max,
                          poly_min=poly_min,
                          poly_max=poly_max)

        return redirect('/data/settings/', request)
