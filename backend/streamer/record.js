const { exec } = require('child_process')

const rtspUrl = 'rtsp://127.0.0.1:554/tdvid'
// The -movflags flag helps FFmpeg write the MP4 file in a way that makes it playable
const command = `ffmpeg -rtsp_transport tcp -i "${rtspUrl}" -t 5 -c copy output.mp4`

console.log('Recording started...')

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Recording error: ${error.message}`)
    return
  }
  console.log('Recording complete! Output saved as output.mp4')
})
