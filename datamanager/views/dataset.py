from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import generic


class DatasetView(LoginRequiredMixin, generic.TemplateView):
    redirect_field_name = None
    template_name = 'dataset.html'
