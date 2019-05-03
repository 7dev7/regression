from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect
from django.template.context_processors import csrf
from django.views import generic

from datamanager.services import dataframe


class DatasetView(LoginRequiredMixin, generic.TemplateView):
    redirect_field_name = None
    template_name = 'dataset.html'

    def get_context_data(self, **kwargs):
        data = super().get_context_data(**kwargs)
        data['data_id'] = kwargs.get('data_id')
        return data

    @staticmethod
    def post(request, data_id):
        args = {}
        args.update(csrf(request))

        column_name = request.POST.get('columnName', None)

        if data_id is not None:
            dataframe.add_column(data_id, column_name)

        return redirect('/data/dataset/' + str(data_id) + '/', request)
