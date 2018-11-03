from django.views import generic
from django.contrib.auth.mixins import LoginRequiredMixin


class HomeView(LoginRequiredMixin, generic.TemplateView):
    redirect_field_name = None
    template_name = 'home.html'
