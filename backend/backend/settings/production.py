from . import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'amesto-db',
        'USER': 'django',
        'PASSWORD': os.getenv('DB_PASS'),
        'HOST': f'/cloudsql/amesto-bdb5c:me-central1:amesto-db',  # Uses Unix socket
        'PORT': '5432',
    }
}

# Security settings
DEBUG = False
ALLOWED_HOSTS = [
    'amesto-backend-646628537801.me-central1.run.app',
    'localhost',
    '127.0.0.1',
    'https://amesto.vercel.app'
]

# CORS settings
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://amesto-backend-646628537801.me-central1.run.app',
    'https://amesto.vercel.app',
]