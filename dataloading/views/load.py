from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect, render_to_response
from django.template.context_processors import csrf
from django.utils.datastructures import MultiValueDictKeyError
from django.views import generic


class LoadView(LoginRequiredMixin, generic.TemplateView):
    redirect_field_name = None
    template_name = 'load.html'

    @staticmethod
    def post(request):
        file = extract_file(request)
        if file is not None:
            # TODO handle file
            return redirect('/', request)
        else:
            args = {}
            args.update(csrf(request))
            args['error'] = 'Пожалуйста, загрузите файл'
            return render_to_response('load.html', args)


def extract_file(request):
    try:
        return request.FILES['inputFile']
    except MultiValueDictKeyError:
        return None
