# Generated by Django 3.1.1 on 2020-09-23 08:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='package',
            name='company_owner',
            field=models.CharField(choices=[('apple', 'Apple'), ('komplett', 'Komplett'), ('fjellsport', 'Fjellsport'), ('dressmann', 'Dressmann'), ('asus', 'Asus')], max_length=200),
        ),
    ]