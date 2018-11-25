from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import generic

from datamanager.models import Document


class DocumentsView(LoginRequiredMixin, generic.ListView):
    redirect_field_name = None
    template_name = 'my_data.html'

    context_object_name = 'documents'

    def get_queryset(self):
        return Document.objects.filter(author=self.request.user)
