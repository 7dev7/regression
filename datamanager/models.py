from datetime import datetime

from django.contrib.auth.models import User
from django.db import models


class Document(models.Model):
    name = models.CharField(max_length=256, null=True, blank=True)
    upload_time = models.DateTimeField(default=datetime.now, blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.FileField(blank=True)
