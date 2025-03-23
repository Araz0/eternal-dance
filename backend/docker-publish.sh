#!/bin/bash

# Exit on error
set -e

# Validate required environment variables
if [ -z "$DOCKER_USERNAME" ]; then
  echo "Error: DOCKER_USERNAME is not set."
  exit 1
fi

# Generate a timestamp tag
TIMESTAMP=$(date +%s)
IMAGE_NAME="$DOCKER_USERNAME/eternal-dance-backend"

# Build the Docker image with both timestamp and latest tags
docker build -t "$IMAGE_NAME:$TIMESTAMP" -t "$IMAGE_NAME:latest" ./backend

# Push both tags to Docker Hub
docker push "$IMAGE_NAME:$TIMESTAMP"
docker push "$IMAGE_NAME:latest"
