FROM python:3.11-slim

# Set workdir
WORKDIR /app

# Copy Django project
COPY ../../backend /app
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Run API or Celery worker
ENTRYPOINT ["/entrypoint.sh"]

