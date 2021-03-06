# Generated by Django 3.0.5 on 2021-02-22 01:49

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('organization', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Item',
            fields=[
                ('Batch_Number', models.CharField(default='N/A', max_length=256)),
                ('Location', models.CharField(default='N/A', max_length=256)),
                ('Plant', models.CharField(default='N/A', max_length=256)),
                ('Zone', models.CharField(default='N/A', max_length=256)),
                ('Aisle', models.IntegerField(null=True)),
                ('Bin', models.CharField(default='N/A', max_length=256)),
                ('Part_Number', models.CharField(default='N/A', max_length=256)),
                ('Part_Description', models.CharField(default='N/A', max_length=256)),
                ('Serial_Number', models.CharField(default='N/A', max_length=256)),
                ('Condition', models.CharField(default='N/A', max_length=256)),
                ('Category', models.CharField(default='N/A', max_length=256)),
                ('Owner', models.CharField(default='N/A', max_length=256)),
                ('Criticality', models.CharField(default='N/A', max_length=256)),
                ('Average_Cost', models.CharField(default='N/A', max_length=256)),
                ('Quantity', models.IntegerField(null=True)),
                ('Unit_of_Measure', models.CharField(default='N/A', max_length=256)),
                ('Item_Id', models.CharField(max_length=256, primary_key=True, serialize=False)),
                ('organization', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='organization.Organization')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
