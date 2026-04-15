FROM python:3.11-slim

# Create non-root user (important for production security)
RUN useradd -m appuser

RUN mkdir -p /app/data \
 && chown -R appuser:appuser /app

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# 🔥 OpenShift-safe permissions to write to sqlite db
RUN mkdir -p /app/data \
 && chgrp -R 0 /app \
 && chmod -R g=u /app
USER appuser

EXPOSE 5000

# Run with Gunicorn (production WSGI server)
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app", "--workers=1", "--timeout=120", "--worker-tmp-dir", "/tmp"]