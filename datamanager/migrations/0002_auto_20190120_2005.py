# Generated by Django 2.1.5 on 2019-01-20 16:05

import django.contrib.postgres.fields.jsonb
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('datamanager', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='dataset',
            name='columns',
            field=django.contrib.postgres.fields.jsonb.JSONField(default=None),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='dataset',
            name='size',
            field=models.IntegerField(default=None),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='dataset',
            name='content',
            field=django.contrib.postgres.fields.jsonb.JSONField(),
        ),
    ]
