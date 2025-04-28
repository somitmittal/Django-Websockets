# Dockerfile for Django WebSocket Service

# Use the official Python image from the Docker Hub
FROM python:3.8-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /

# Install build dependencies
RUN apt-get update && \
    apt-get install -y gcc build-essential libffi-dev python3-dev && \
    rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Run the application
CMD ["uvicorn", "app.asgi:application", "--host", "0.0.0.0", "--port", "8000"]