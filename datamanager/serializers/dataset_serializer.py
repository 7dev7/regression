from rest_framework import serializers

from datamanager.models import Dataset


class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = ('pk', 'name', 'upload_time', 'author', 'content')
