# Generated by Django 3.1.1 on 2020-09-23 12:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0002_auto_20200923_1044'),
    ]

    operations = [
        migrations.CreateModel(
            name='Beacon',
            fields=[
                ('id', models.CharField(max_length=200, primary_key=True, serialize=False)),
                ('description', models.CharField(max_length=200)),
            ],
        ),
    ]
