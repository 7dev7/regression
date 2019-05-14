from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render_to_response
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

        try:
            cfg.update_config(request.user, unique_values_threshold=unique_values_threshold,
                              nn_hidden_min=nn_hidden_min,
                              nn_hidden_max=nn_hidden_max,
                              poly_min=poly_min,
                              poly_max=poly_max)
            args['message'] = 'Настройки сохранены'
            args['message_class'] = 'success'
        except:
            print('error during saving settings')
            args['message'] = 'Ошибка при сохранении настроек'
            args['message_class'] = 'danger'

        user = request.user
        args['settings'] = Configuration.objects.get(owner=user)
        return render_to_response('settings.html', args)
