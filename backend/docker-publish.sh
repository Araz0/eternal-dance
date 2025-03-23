#!/bin/bash

# Exit on error
set -e

# Build the Docker image
docker build -t "$DOCKER_USERNAME/eternal-dance-backend:latest" ./backend

# Push the Docker image to Docker Hub
docker push "$DOCKER_USERNAME/eternal-dance-backend:latest"
