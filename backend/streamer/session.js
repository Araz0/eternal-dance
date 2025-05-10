import fs from 'fs'
import { recordStream } from './record.js'
import { uploadVideo, uploadImage } from './upload.js'
import { Highlighter } from './Highlighter.js'

export async function startSession() {
  const timestamp = Date.now()
  const recordingDurationInSeconds = 30

  // Ensure the streams directory exists
  if (!fs.existsSync('./streams')) {
    fs.mkdirSync('./streams', { recursive: true })
  }

  const videoPath = await recordStream({
    rtspUrl: process.env.RTSP_URL || 'rtsp://127.0.0.1:554/tdvidstream',
    duration: recordingDurationInSeconds,
    outputFile: './streams/' + timestamp + '.mp4',
  })
  console.log('Video saved to:', videoPath)

  const highlighter = new Highlighter(videoPath)
  try {
    const { finalVideo, thumbnail, croppedVideo, croppedThumbnail } =
      await highlighter.highlight()
    console.log('local paths:', {
      finalVideo,
      thumbnail,
      croppedVideo,
      croppedThumbnail,
    })

    console.log('Uploading...')
    const onlineReelLink = await uploadVideo(croppedVideo)

    console.log('## ~ onlineReelLink:', onlineReelLink)

    const onlineThumbnailLink = await uploadImage(croppedThumbnail)

    console.log('## ~ onlineThumbnailLink:', onlineThumbnailLink)
  } catch (error) {
    console.error('Error:', error)
  }
}
