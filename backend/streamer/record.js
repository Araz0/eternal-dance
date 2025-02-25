const { exec } = require('child_process')

const rtspUrl = 'rtsp://127.0.0.1:554/tdvidstream'
const timestampNumber = Date.now()
const command = `ffmpeg -rtsp_transport tcp -i "${rtspUrl}" -t 5 -c copy ${timestampNumber}.mp4`

console.log('Recording started...')
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Recording error: ${error.message}`)
    return
  }
  console.log(`Recording complete! Output saved as ${timestampNumber}.mp4`)
})
