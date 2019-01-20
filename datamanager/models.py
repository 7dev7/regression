from django.contrib.auth.models import User
from django.contrib.postgres.fields import JSONField
from django.db import models
from django.utils import timezone


class Dataset(models.Model):
    name = models.CharField(max_length=256, null=True, blank=True)
    upload_time = models.DateTimeField(default=timezone.now, blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = JSONField()
    columns = JSONField()
    size = models.IntegerField()
