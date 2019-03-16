from rest_framework.decorators import api_view, parser_classes, authentication_classes
from rest_framework.parsers import JSONParser
from rest_framework.response import Response

from datamanager.services.dataframe import get_dataframe
from datamanager.views.rest.csrf_auth import CsrfExemptSessionAuthentication


@api_view(['POST'])
@parser_classes((JSONParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def column_info(request):
    column = request.data['column']
    dataset_id = int(request.data['data_id'])

    df = get_dataframe(dataset_id=dataset_id)

    return Response({
        'values': df[[column]][column]
    })
