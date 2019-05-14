from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect, render
from django.template.context_processors import csrf
from django.views import generic

import datamanager.services.missing_values as miss_values
from datamanager.models import Dataset
from datamanager.services import dataframe


class DatasetView(LoginRequiredMixin, generic.TemplateView):
    redirect_field_name = None
    template_name = 'dataset.html'

    @staticmethod
    def get(request, data_id):
        try:
            dataset = Dataset.objects.get(id=data_id)
        except:
            return redirect('/data/', request)

        if dataset.author.id != request.user.id:
            return redirect('/data/', request)

        args = {'data_id': data_id, 'dataset': dataset}
        nan_columns = miss_values.get_nan_columns_for_ds(data_id)
        args['nan_visible'] = len(nan_columns) != 0
        return render(request, 'dataset.html', args)

    @staticmethod
    def post(request, data_id):
        args = {}
        args.update(csrf(request))

        column_name = request.POST.get('columnName', None)

        if data_id is not None:
            dataframe.add_column(data_id, column_name)

        return redirect('/data/dataset/' + str(data_id) + '/', request)
