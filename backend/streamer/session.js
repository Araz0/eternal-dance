import fs from 'fs'
import { recordStream } from './record.js'
import { uploadVideo, uploadImage } from './upload.js'
import { Highlighter } from './highlighter.js'
import { logger } from './utils/logger.js'

/**
 * Represents a session for recording and processing video streams.
 */
/**
 * Represents a video recording session.
 * Handles the recording of video streams, post-processing to generate highlights,
 * and uploading the processed files to an online platform.
 */
export class Session {
  /**
   * Initializes a new Session instance.
   * Ensures the recordings folder exists and sets default properties.
   */
  constructor() {
    this.recording = false
    this.videoPath = null
    this.timestamp = null
    this.recordingPromise = null
    this.recordingsFolder = './streams'

    // Ensure the streams directory exists
    if (!fs.existsSync(this.recordingsFolder)) {
      fs.mkdirSync(this.recordingsFolder, { recursive: true })
    }
  }

  /**
   * Starts a new recording session.
   * Records a video stream for a specified duration, processes the video to generate highlights,
   * and uploads the processed files. If a recording is already in progress, it will not start a new one.
   *
   * @async
   * @param {number} [durationInSeconds] - The duration of the recording in seconds. Defaults to the value set in the constructor.
   * @returns {Promise<Object>} An object containing the online links for the processed video and thumbnail.
   * @throws {Error} If an error occurs during recording, processing, or uploading.
   */
  async startRecording(durationInSeconds) {
    if (this.recording) {
      logger('Recording is already in progress.')
      return
    }

    this.recording = true
    logger(
      `Started recording with ${durationInSeconds} seconds from the startRecording method`
    )
    this.timestamp = Date.now()

    try {
      this.recordingPromise = recordStream({
        rtspUrl: process.env.RTSP_URL || 'rtsp://127.0.0.1:554/tdvidstream',
        duration: durationInSeconds,
        outputFile: this.recordingsFolder + '/' + this.timestamp + '.mp4',
      })
      this.videoPath = await this.recordingPromise
      logger('Video saved to:', this.videoPath)

      // Automatically handle post-processing after recording ends
      this.recording = false
      logger('Recording stopped.')

      if (this.videoPath && this.videoPath !== -1) {
        const highlighter = new Highlighter(this.videoPath)
        try {
          const { finalVideo, thumbnail, croppedVideo, croppedThumbnail } =
            await highlighter.highlight()
          logger('Local paths:', {
            finalVideo,
            thumbnail,
            croppedVideo,
            croppedThumbnail,
          })

          logger('Uploading...')
          const onlineReelLink = await uploadVideo(croppedVideo)
          logger('## ~ onlineReelLink:', onlineReelLink)

          const onlineThumbnailLink = await uploadImage(croppedThumbnail)
          logger('## ~ onlineThumbnailLink:', onlineThumbnailLink)

          // Return the online links
          return {
            onlineReelLink,
            onlineThumbnailLink,
          }
        } catch (error) {
          console.error('Error during processing:', error)
        }
      }
    } catch (error) {
      console.error('Error during recording:', error)
      this.recording = false
    }
  }

  /**
   * Cancels the ongoing recording session.
   * Stops the recording process, cleans up any partially created files,
   * and resets the session state.
   *
   * @async
   */
  async cancelRecording(currentStatus = 0) {
    if (currentStatus == 0) {
      logger('Ready to record new session')
    }
    if (!this.recording && currentStatus != 0) {
      logger('No recording is in progress to cancel.')
      return
    }

    this.recording = false
    logger('Recording canceled.')

    // If the recording promise is still pending, reject it
    if (this.recordingPromise) {
      try {
        await this.recordingPromise
      } catch {
        logger('Recording process was canceled.')
      }
    }

    // Clean up any partially created files
    if (this.videoPath && fs.existsSync(this.videoPath)) {
      fs.unlinkSync(this.videoPath)
      logger('Partial video file deleted:', this.videoPath)
    }
  }
}
