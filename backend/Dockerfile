# Use a base image with Node.js
FROM node:20

# Set the working directory
WORKDIR /app

# Install FFmpeg using apt
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Copy the backend code
COPY ./streamer ./streamer
COPY ./apis ./apis

# Set default environment variable for RTSP URL
ENV RTSP_URL=rtsp://host.docker.internal:554/tdvidstream

# Create the streams directory
RUN mkdir -p /app/streamer/streams

# Install dependencies
RUN cd streamer && npm install

# Expose the ports used by the server and WebSocket connections
EXPOSE 3000 8080 8081

# Start the server
CMD ["node", "streamer/server.js"]