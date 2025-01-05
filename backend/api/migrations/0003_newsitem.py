# Generated by Django 5.0.2 on 2024-12-18 19:27

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0002_orderhistory_order_email"),
    ]

    operations = [
        migrations.CreateModel(
            name="NewsItem",
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
                ("text", models.CharField(max_length=300)),
                ("picture", models.URLField()),
                ("date_created", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ["-date_created"],
                "indexes": [
                    models.Index(fields=["-date_created"], name="news_date_id")
                ],
            },
        ),
    ]
