from django.contrib import admin

from datamanager.models import Dataset, MlModel

# Register your models here.
admin.site.register([
    Dataset,
    MlModel
])
