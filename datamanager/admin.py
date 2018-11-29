from django.contrib import admin

from datamanager.models import Dataset

# Register your models here.
admin.site.register([
    Dataset,
])
