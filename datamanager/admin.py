from django.contrib import admin

from datamanager.models import Document

# Register your models here.
admin.site.register([
    Document,
])
