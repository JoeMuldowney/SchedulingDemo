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

# Change ownership to non-root user
RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Run with Gunicorn (production WSGI server)
CMD ["gunicorn", "-b", "0.0.0.0:8000", "app:app", "--workers=1", "--timeout=120"]