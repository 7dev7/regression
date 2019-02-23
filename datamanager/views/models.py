from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect
from django.template.context_processors import csrf
from django.views import generic

import datamanager.services.models as mls
from datamanager.models import MlModel


class ModelsView(LoginRequiredMixin, generic.ListView):
    redirect_field_name = None
    template_name = 'models.html'

    context_object_name = 'models'

    def get_queryset(self):
        return MlModel.objects.filter(author=self.request.user)

    @staticmethod
    def post(request):
        args = {}
        args.update(csrf(request))

        model_id = request.POST.get('model_id', None)

        if model_id is not None:
            mls.delete_model(model_id)

        return redirect('/data/models/', request)
