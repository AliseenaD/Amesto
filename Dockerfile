# Use Python 3.10
FROM python:3.10

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV DJANGO_SETTINGS_MODULE=backend.settings.production
ENV PORT 8080

# Set work directory
WORKDIR /app

RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn psycopg2-binary

# Copy backend project
COPY backend/ .

# Copy the data dump file
COPY db_dump.json .

# Expose port 8080 (Cloud Run expects 8080)
EXPOSE 8080

# Run gunicorn with timeout settings
CMD exec gunicorn --bind "0.0.0.0:${PORT}" --timeout 120 backend.wsgi:application