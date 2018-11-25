from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect
from django.template.context_processors import csrf
from django.views import generic

from datamanager.models import Document
from datamanager.services.services import delete_document


class DocumentsView(LoginRequiredMixin, generic.ListView):
    redirect_field_name = None
    template_name = 'my_data.html'

    context_object_name = 'documents'

    def get_queryset(self):
        return Document.objects.filter(author=self.request.user)

    def post(self, request):
        args = {}
        args.update(csrf(request))

        doc_id = request.POST.get('doc_id', None)

        if doc_id is not None:
            delete_document(doc_id)

        return redirect('/data', request)
