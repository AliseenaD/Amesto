# Generated by Django 5.0.2 on 2025-01-04 19:49

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0003_newsitem"),
    ]

    operations = [
        migrations.CreateModel(
            name="Brand",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=100)),
                (
                    "product_type",
                    models.CharField(
                        choices=[
                            ("Phone", "Phone"),
                            ("Speaker", "Speaker"),
                            ("Headphone", "Headphone"),
                            ("Watch", "Watch"),
                            ("Accessory", "Accessory"),
                        ],
                        max_length=100,
                    ),
                ),
            ],
            options={
                "unique_together": {("name", "product_type")},
            },
        ),
    ]
