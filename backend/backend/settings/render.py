from . import *
import dj_database_url

# Static files configuration
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Add whitenoise to middleware
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')

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