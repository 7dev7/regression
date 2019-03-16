from rest_framework.decorators import api_view, parser_classes, authentication_classes
from rest_framework.parsers import JSONParser
from rest_framework.response import Response

import datamanager.services.models as mls
from datamanager.views.rest.analysis_rest import CsrfExemptSessionAuthentication


@api_view(['POST'])
@parser_classes((JSONParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def save_model(request):
    in_cols = request.data['in']
    out_cols = request.data['out']
    data_id = request.data['data_id']
    model = request.data['model']
    degree = request.data.get('degree', None)

    if not mls.check_model_correct(in_cols, out_cols, data_id, model, degree, request.user):
        return Response({'status': 'fail', 'error_message': 'Модель с выбранными параметрами уже существует'})

    mls.save_ml_model(in_cols, out_cols, data_id, model, degree, request.user)
    return Response({'status': 'ok'})
