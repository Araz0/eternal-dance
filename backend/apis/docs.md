# Video Upload & Listing API

This API allows users to upload `.mp4` videos and retrieve a list of uploaded videos.

## Base URL

The API is hosted at:

```

https://eternal-dance.art/exps/api.php

```

## Endpoints

### 1. Upload a Video

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

### 2. List Uploaded Videos

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

## Example: Using the API in React

### Upload a Video

```jsx
const uploadVideo = async (file) => {
  const formData = new FormData()
  formData.append('video', file)

  try {
    const response = await fetch('https://eternal-dance.art/exps/api.php', {
      method: 'POST',
      body: formData,
    })
    const result = await response.json()
    console.log('Upload Response:', result)
  } catch (error) {
    console.error('Error uploading video:', error)
  }
}
```

### Fetch Uploaded Videos

```jsx
const fetchVideos = async () => {
  try {
    const response = await fetch('https://eternal-dance.art/exps/api.php')
    const data = await response.json()
    console.log('Videos:', data.files)
  } catch (error) {
    console.error('Error fetching videos:', error)
  }
}
```

## Notes

- Maximum file size: **80MB**
- Allowed file type: **MP4**
- The API will return a list of video file paths relative to the base domain.

```

This gives a clear overview of how to use your API, along with React-friendly examples. Let me know if you need any tweaks! 🚀
```
