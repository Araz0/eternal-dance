import fs from 'fs'
import { recordStream } from './record.js'
import { uploadVideo } from './upload.js'
// import { UDPServer } from './touchdesigner-server.js'
import { Highlighter } from './Highlighter.js'

const timestamp = Date.now()
const recordingDurationInSeconds = 30

// Ensure the streams directory exists
if (!fs.existsSync('./streams')) {
  fs.mkdirSync('./streams', { recursive: true })
}

console.log('Triggering video recording...')
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
  console.log('Final paths:', {
    finalVideo,
    thumbnail,
    croppedVideo,
    croppedThumbnail,
  })

  console.log('Uploading video...')
  const onlineLink = await uploadVideo(croppedVideo)
  console.log('Video uploaded:', onlineLink)
} catch (error) {
  console.error('Error:', error)
}

// // Initialize the UDP server
// const udpServer = new UDPServer('127.0.0.1', 41234) // Replace with your desired IP and port

// udpServer.onCallback(async (currentValue) => {
//   console.log('Received value from UDP:', currentValue)

//   if (currentValue === 1 || currentValue === '1' || currentValue === 1.0) {

//   } else {
//     console.log('No action triggered for value:', currentValue)
//   }
// })
// udpServer.start()

// const VIDEO_PATH = '.\\streams\\3min.mp4'
// const highlighter = new Highlighter(VIDEO_PATH)
// try {
//   const { finalVideo, thumbnail } = await highlighter.highlight()
//   console.log('Final video path:', finalVideo)
//   console.log('Thumbnail path:', thumbnail)
// } catch (error) {
//   console.error('Error:', error)
// }

// async function runRecordStream() {
//   // Example usage (custom parameters):
//   const videoPath = await recordStream({
//     rtspUrl: process.env.RTSP_URL || 'rtsp://127.0.0.1:554/tdvidstream',
//     duration: recordingDurationInSeconds,
//     outputFile: './streams/' + timestamp + '.mp4',
//   })
//   console.log('Video saved to:', videoPath)

//   // upload video online
//   // try {
//   //   console.log('will try to upload video now:', videoPath)
//   //   // Upload the recorded video.
//   //   const onlineLink = await uploadVideo(videoPath)
//   //   console.log('Video uploaded:', onlineLink)
//   // } catch (error) {
//   //   console.error('Error uploading video file:', error)
//   // }

//   return videoPath
// }

// console.log(
//   `Recording video stream with duration of ${recordingDurationInSeconds} seconds...`
// )

// console.time('runRecordStream')
// runRecordStream().then(() => {
//   console.timeEnd('runRecordStream')
// })
