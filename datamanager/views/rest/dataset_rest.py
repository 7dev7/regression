from pandas.core.dtypes.common import is_string_dtype
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, authentication_classes
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.response import Response

from datamanager.models import Dataset
from datamanager.serializers.dataset_serializer import DatasetSerializer
from datamanager.services.dataframe import get_dataframe, update_dataframe
from datamanager.views.rest.csrf_auth import CsrfExemptSessionAuthentication


@api_view(['GET'])
def dataset_detail(request, data_id):
    """
    Retrieve a dataset
    """
    try:
        snippet = Dataset.objects.get(pk=data_id)
    except Dataset.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = DatasetSerializer(snippet)
    return Response(serializer.data)


@api_view(['POST'])
@parser_classes((MultiPartParser, FormParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def edit_row(request, data_id):
    row_num = int(request.data['__row_id__'])
    df = get_dataframe(data_id)

    columns = list(df)
    for i in columns:
        df[i][row_num] = request.data[i]

    update_dataframe(df, data_id)
    return Response({})


@api_view(['POST'])
@parser_classes((MultiPartParser, FormParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def add_row(request, data_id):
    df = get_dataframe(data_id)

    columns = list(df)
    values = {}
    for i in columns:
        # TODO add type parsing
        values[i] = request.data[i]

    df = df.append(values, ignore_index=True)
    update_dataframe(df, data_id)

    return Response(df.shape[0])


@api_view(['POST'])
@parser_classes((MultiPartParser, FormParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def remove_row(request, data_id):
    df = get_dataframe(data_id)
    row_num = int(request.data['id'])

    df = df.drop(df.index[row_num])

    update_dataframe(df, data_id)
    return Response()


@api_view(['POST'])
@parser_classes((JSONParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def remove_column(request, data_id):
    df = get_dataframe(data_id)
    column = request.data['column']

    df = df.drop(columns=[column])

    update_dataframe(df, data_id)
    return Response({'ok'})


@api_view(['POST'])
@parser_classes((JSONParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def analysis(request):
    ds_id = request.data['dataset_id']
    in_columns = request.data['in_columns']
    out_columns = request.data['out_columns']

    df = get_dataframe(ds_id)

    in_uniques = dict(zip(in_columns, df[in_columns].nunique().tolist()))
    out_uniques = dict(zip(out_columns, df[out_columns].nunique().tolist()))

    in_types = {}
    for col in in_columns:
        is_string_type = is_string_dtype(df[col])
        in_types[col] = 'str' if is_string_type else 'num'

    out_types = {}
    for col in out_columns:
        is_string_type = is_string_dtype(df[col])
        out_types[col] = 'str' if is_string_type else 'num'

    return Response({
        # TODO make configurable
        'unique_threshold': 5,
        'in_columns': in_columns,
        'out_columns': out_columns,
        'in_unique': in_uniques,
        'out_unique': out_uniques,
        'in_types': in_types,
        'out_types': out_types
    })
