from django.contrib import admin

from datamanager.models import Dataset, MlModel, Configuration

# Register your models here.
admin.site.register([
    Dataset,
    MlModel,
    Configuration
])
