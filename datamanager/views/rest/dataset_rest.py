from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from datamanager.models import Dataset
from datamanager.serializers.dataset_serializer import DatasetSerializer


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
