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

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Набор данных'
        verbose_name_plural = 'Наборы данных'


class MlModel(models.Model):
    name = models.CharField(max_length=256, null=True, blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    creation_time = models.DateTimeField(default=timezone.now, blank=True)
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE)
    ds_in_cols = JSONField()
    ds_out_cols = JSONField()
    model = models.CharField(max_length=20)
    degree = models.IntegerField(blank=True, null=True)
    activation = models.CharField(blank=True, null=True, max_length=32)
    hidden_layer = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Модель'
        verbose_name_plural = 'Модели'


class Configuration(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    unique_values_threshold = models.IntegerField(null=False, blank=False, default=5)
    p_value = models.FloatField(null=False, blank=False, default=0.05)
    nn_hidden_min = models.IntegerField(null=False, blank=False, default=2)
    nn_hidden_max = models.IntegerField(null=False, blank=False, default=10)
    poly_min = models.IntegerField(null=False, blank=False, default=2)
    poly_max = models.IntegerField(null=False, blank=False, default=10)
    highlightLimit = models.IntegerField(null=False, blank=False, default=5)

    def __str__(self):
        return self.owner.username

    class Meta:
        verbose_name = 'Конфигурация'
        verbose_name_plural = 'Конфигурации'
