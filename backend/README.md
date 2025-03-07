# Eternal Dance Backend

This is the backend for the Eternal Dance project. It handles video recording, uploading, and listing functionalities.

## Overview

The backend consists of several components:

- **apis**: Contains the API for uploading and listing videos.
- **exps**: Contains experimental scripts and combined functionalities.
- **streamer**: Contains scripts for recording video streams and uploading them.

## Installation

1. Clone the repository.
2. Navigate to the `backend` directory.
3. Install dependencies for the `streamer` component:
   ```bash
   cd streamer
   npm install
   ```

## Usage

### Recording and Uploading Videos

1. Navigate to the `streamer` directory:
   ```bash
   cd streamer
   ```
2. Run the `server.js` script to record and upload a video stream:
   ```bash
   node server.js
   ```

### API Endpoints

The API is hosted at: `https://eternal-dance.art/exps/api.php`

#### 1. Upload a Video

**Endpoint:**

```
POST /api.php
```

**Request:**

- **Form Data:**
  - `video`: (File) The `.mp4` file to be uploaded.

**Response:**

```json
{
  "status": "success",
  "message": "File uploaded successfully.",
  "file": "video_1234567890.mp4"
}
```

#### 2. List Uploaded Videos

**Endpoint:**

```
GET /api.php
```

**Response:**

```json
{
  "baseDomain": "https://eternal-dance.art",
  "files": ["/uploads/video_1234567890.mp4", "/uploads/video_0987654321.mp4"]
}
```
