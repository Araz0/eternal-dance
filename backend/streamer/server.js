const { recordStream } = require('./record')
const { uploadVideo } = require('./upload')
const fs = require('fs')

const timestamp = Date.now()
const recordingDurationInSeconds = 3

// Ensure the streams directory exists
if (!fs.existsSync('./streams')) {
  fs.mkdirSync('./streams', { recursive: true })
}

async function runRecordStream() {
  // Example usage (custom parameters):
  const videoPath = await recordStream({
    rtspUrl: process.env.RTSP_URL || 'rtsp://127.0.0.1:554/tdvidstream',
    duration: recordingDurationInSeconds,
    outputFile: './streams/' + timestamp + '.mp4',
  })
  console.log('Video saved to:', videoPath)

  try {
    console.log('will try to upload video now:', videoPath)
    // Upload the recorded video.
    const onlineLink = await uploadVideo(videoPath)
    console.log('Video uploaded:', onlineLink)
  } catch (error) {
    console.error('Error uploading video file:', error)
  }

  return videoPath
}

console.log(
  `Recording video stream with duration of ${recordingDurationInSeconds} seconds...`
)

console.time('runRecordStream')
runRecordStream().then(() => {
  console.timeEnd('runRecordStream')
})
