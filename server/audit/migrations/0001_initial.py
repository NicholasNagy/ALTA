# Generated by Django 3.0.5 on 2021-01-31 23:35

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import djongo.models.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('inventory_item', '0001_initial'),
        ('organization', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('audit_template', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Audit',
            fields=[
                ('audit_id', models.AutoField(primary_key=True, serialize=False)),
                ('initiated_on', models.DateTimeField(auto_now_add=True)),
                ('last_modified_on', models.DateTimeField(auto_now=True)),
                ('status', models.CharField(default='Pending', max_length=50)),
                ('assigned_sk', models.ManyToManyField(blank=True, default=0, to=settings.AUTH_USER_MODEL)),
                ('initiated_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='initiated_by', to=settings.AUTH_USER_MODEL)),
                ('inventory_items', models.ManyToManyField(blank=True, default=0, to='inventory_item.Item')),
                ('organization', models.ForeignKey(default=0, on_delete=django.db.models.deletion.CASCADE, to='organization.Organization')),
                ('template_id', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='audit_template.AuditTemplate')),
            ],
        ),
        migrations.CreateModel(
            name='BinToSK',
            fields=[
                ('bin_id', models.AutoField(primary_key=True, serialize=False)),
                ('Bin', models.CharField(max_length=256)),
                ('item_ids', djongo.models.fields.JSONField(blank=True, null=True)),
                ('customuser', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('init_audit', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='audit.Audit')),
            ],
        ),
    ]
