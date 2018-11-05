from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import generic


class HomeView(LoginRequiredMixin, generic.TemplateView):
    redirect_field_name = None
    template_name = 'home.html'
