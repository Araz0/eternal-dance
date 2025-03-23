# Use a base image with Node.js
FROM node:18

# Set the working directory
WORKDIR /app

# Copy the backend code
COPY ./streamer ./streamer
COPY ./apis ./apis

# Copy your custom FFmpeg build into the container
COPY ./ffmpeg /usr/local/ffmpeg

# Ensure FFmpeg binaries are executable
RUN chmod +x /usr/local/ffmpeg/ffmpeg /usr/local/ffmpeg/ffprobe

# Add FFmpeg to PATH
ENV PATH="/usr/local/ffmpeg:$PATH"

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
