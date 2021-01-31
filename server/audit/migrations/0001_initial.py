# Generated by Django 3.0.5 on 2021-01-31 00:45

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import djongo.models.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('organization', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('inventory_item', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Audit',
            fields=[
                ('audit_id', models.AutoField(primary_key=True, serialize=False)),
                ('status', models.CharField(default='Pending', max_length=50)),
                ('assigned_sk', models.ManyToManyField(blank=True, default=0, to=settings.AUTH_USER_MODEL)),
                ('inventory_items', models.ManyToManyField(blank=True, default=0, to='inventory_item.Item')),
                ('organization', models.ForeignKey(default=0, on_delete=django.db.models.deletion.CASCADE, to='organization.Organization')),
            ],
        ),
        migrations.CreateModel(
            name='ItemToSK',
            fields=[
                ('itemtoSk_id', models.AutoField(primary_key=True, serialize=False)),
                ('item_ids', djongo.models.fields.JSONField(blank=True, null=True)),
                ('bins', djongo.models.fields.JSONField(blank=True, null=True)),
                ('customuser', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('init_audit', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='audit.Audit')),
            ],
        ),
    ]
