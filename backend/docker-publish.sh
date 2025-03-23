#!/bin/bash

# Exit on error
set -e

# Build the Docker image with a timestamp tag
docker build -t "$DOCKER_USERNAME/eternal-dance-backend:$(date +%s)" ./backend

# Push the Docker image to Docker Hub
docker push "$DOCKER_USERNAME/eternal-dance-backend:$(date +%s)"
