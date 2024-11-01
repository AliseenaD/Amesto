import os
import django
from django.conf import settings

# Use production settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings.production')
django.setup()

from django.db import connections
from django.db.utils import OperationalError

def test_connection():
    try:
        db_conn = connections['default']
        db_conn.cursor()
        print("Successfully connected to PostgreSQL database on Google Cloud!")
        print(f"Database name: {settings.DATABASES['default']['NAME']}")
        print(f"Database host: {settings.DATABASES['default']['HOST']}")
    except OperationalError as e:
        print("Failed to connect to the database.")
        print(f"Error: {str(e)}")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    test_connection()