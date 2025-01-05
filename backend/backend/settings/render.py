from . import *
import dj_database_url

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL')
DATABASES = {
    'default': dj_database_url.config(
        default=DATABASE_URL,
        conn_max_age=600
    )
}

# Redis configuration (using Render Redis instance)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': os.getenv('REDIS_URL'),
    }
}

# Security settings
DEBUG = False
ALLOWED_HOSTS = [
    '.onrender.com',  # Allows all subdomains on render.com
    'amesto.vercel.app'
]

CORS_ALLOWED_ORIGINS = [
    'https://amesto.vercel.app',
]

# Add whitenoise to middleware
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')

# Add this for whitenoise
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')