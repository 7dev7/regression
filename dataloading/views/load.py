from django.views import generic
from django.contrib.auth.mixins import LoginRequiredMixin


class LoadView(LoginRequiredMixin, generic.TemplateView):
    redirect_field_name = None
    template_name = 'load.html'
