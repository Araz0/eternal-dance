import { exec } from 'child_process'
import { logger } from './utils/logger.js'

// // Example usage (using defaults):
// recordStream()

// Example usage (custom parameters):
// recordStream({ rtspUrl: 'rtsp://your-ip/stream', duration: 10, outputFile: 'custom.mp4' })
export function recordStream({ rtspUrl, duration, outputFile } = {}) {
  logger(`Using RTSP URL: ${rtspUrl}`) // Log the RTSP URL being used
  return new Promise((resolve) => {
    const command = `ffmpeg -rtsp_transport tcp -i "${rtspUrl}" -t ${duration} -c:v copy -c:a copy ${outputFile}`

    logger(`Recording started for ${duration} seconds`)
    exec(command, (error, stdout, stderr) => {
      if (error) {
        logger(`Recording error: ${error.message}`)
        resolve(-1)
        return
      }
      logger(`Recording complete! Output saved as ${outputFile}`)
      resolve(outputFile)
    })
  })
}
