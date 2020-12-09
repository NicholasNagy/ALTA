# Generated by Django 3.0.5 on 2020-12-09 02:10

from django.db import migrations, models
import djongo.models.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='AuditTemplate',
            fields=[
                ('template_id', models.AutoField(primary_key=True, serialize=False)),
                ('title', models.CharField(blank=True, max_length=256)),
                ('location', models.CharField(blank=True, max_length=256)),
                ('plant', models.CharField(blank=True, max_length=256)),
                ('zones', djongo.models.fields.JSONField(blank=True, null=True)),
                ('aisles', djongo.models.fields.JSONField(blank=True, null=True)),
                ('bins', djongo.models.fields.JSONField(blank=True, null=True)),
                ('part_number', models.CharField(blank=True, max_length=256)),
                ('serial_number', models.CharField(blank=True, max_length=256)),
                ('description', models.TextField(blank=True)),
            ],
        ),
    ]