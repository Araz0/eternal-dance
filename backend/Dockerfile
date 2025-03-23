# Use a base image with Node.js
FROM node:18

# Set the working directory
WORKDIR /app

# Install FFmpeg using apt
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Copy the backend code
COPY ./streamer ./streamer
COPY ./apis ./apis

# Set default environment variable for RTSP URL
ENV RTSP_URL=rtsp://127.0.0.1:554/tdvidstream

# Create the streams directory
RUN mkdir -p /app/streamer/streams

# Install dependencies
RUN cd streamer && npm install

# Expose the port used by the server
EXPOSE 3000

# Start the server
CMD ["node", "streamer/server.js"]