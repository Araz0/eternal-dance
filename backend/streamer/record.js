const { exec } = require('child_process')

// // Example usage (using defaults):
// recordStream()

// Example usage (custom parameters):
// recordStream({ rtspUrl: 'rtsp://your-ip/stream', duration: 10, outputFile: 'custom.mp4' })

function recordStream({ rtspUrl, duration, outputFile } = {}) {
  console.log(`Using RTSP URL: ${rtspUrl}`) // Log the RTSP URL being used
  return new Promise((resolve) => {
    const command = `ffmpeg -rtsp_transport tcp -i "${rtspUrl}" -t ${duration} -c copy ${outputFile}`

    console.log('Recording started...')
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Recording error: ${error.message}`)
        resolve(-1)
        return
      }
      console.log(`Recording complete! Output saved as ${outputFile}`)
      resolve(outputFile)
    })
  })
}

module.exports = {
  recordStream,
}
