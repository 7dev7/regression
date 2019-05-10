import json
from tempfile import TemporaryFile

from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.files import File
from django.http import HttpResponse
from django.views import generic


class ExportModelView(LoginRequiredMixin, generic.View):
    redirect_field_name = None

    @staticmethod
    def get(request, model_id):
        # TODO replace to real data
        data = {'a': 1, 'b': 2}
        with TemporaryFile() as f:
            json_value = json.dumps(data)
            f.write(json_value.encode())
            f.seek(0)  # go back to the beginning of the file
            export_file = File(f)
            name = 'abc.json'
            response = HttpResponse(export_file, content_type='application/json')
            response['Content-Disposition'] = 'attachment; filename=' + name
            return response
