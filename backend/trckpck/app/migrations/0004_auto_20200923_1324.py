# Generated by Django 3.1.1 on 2020-09-23 13:24

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0003_beacon'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='package',
            unique_together={('company_owner', 'tracker_id')},
        ),
    ]
