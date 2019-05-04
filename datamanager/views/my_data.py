from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect
from django.template.context_processors import csrf
from django.views import generic

from datamanager.models import Dataset
from datamanager.services.dataset import delete_dataset


class DatasetView(LoginRequiredMixin, generic.ListView):
    redirect_field_name = None
    template_name = 'my_data.html'

    context_object_name = 'dataset'

    def get_queryset(self):
        return Dataset.objects.filter(author=self.request.user).order_by('-upload_time')

    @staticmethod
    def post(request):
        args = {}
        args.update(csrf(request))

        ds_id = request.POST.get('ds_id', None)

        if ds_id is not None:
            delete_dataset(ds_id)

        return redirect('/data', request)
