# Dockerfile for Çekirdek seeding server (Twisted UDP)
FROM python:3.11-slim
WORKDIR /app

# Install build deps if necessary
RUN apt-get update && apt-get install -y --no-install-recommends build-essential git && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

# Default port for UDP seeding (can be overridden with SEED_PORT env var)
ENV SEED_PORT=9999

CMD ["python", "server.py"]
