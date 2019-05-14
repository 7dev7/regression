from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render_to_response, redirect
from django.views import generic

from datamanager.models import MlModel
from datamanager.services.auto_analysis import func_mapping
from datamanager.services.dataframe import get_columns_meta


class ModelView(LoginRequiredMixin, generic.TemplateView):
    redirect_field_name = None
    template_name = 'model.html'

    @staticmethod
    def get(request, model_id):
        args = {}
        try:
            model = MlModel.objects.get(pk=model_id)
        except:
            return redirect('/data/models/', request)

        if model.author.id != request.user.id:
            return redirect('/data/models/', request)

        args['model'] = model

        args['meta'] = get_columns_meta(model.dataset.id, model.ds_in_cols) + \
                       get_columns_meta(model.dataset.id, model.ds_out_cols)
        args['activation'] = func_mapping.get(model.activation, '')

        return render_to_response('model.html', args)
