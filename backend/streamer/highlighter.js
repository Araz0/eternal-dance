import { exec } from 'child_process'
import fs from 'fs'

import { logger } from './utils/logger.js'

/**
 * Highlighter class for processing video files to extract highlights, generate thumbnails,
 * and create a final video output.
 */
export class Highlighter {
  /**
   * Creates an instance of Highlighter.
   * @param {string} videoPath - The path to the video file to be processed.
   */
  constructor(videoPath) {
    logger('## ~ Highlighter ~ constructor ~ videoPath:', videoPath)

    this.videoPath = videoPath
    this.outputName = Date.now()
    this.width = null
    this.height = null
    this.duration = null
    this.initializeMetadata(videoPath)
  }

  /**
   * Initializes video metadata by calling getVideoMetadata.
   * @param {string} videoPath - The path to the video file.
   */
  async initializeMetadata(videoPath) {
    const { width, height, duration } = await this.getVideoMetadata(videoPath)
    this.width = width
    this.height = height
    this.duration = duration
  }

  /**
   * Retrieves the width, height, and duration of the video using ffprobe.
   * @param {string} videoPath - The path to the video file.
   * @returns {Promise<Object>} - A promise that resolves to an object containing width, height, and duration of the video.
   * @throws {Error} - Throws an error if the video file is not found or if there is an issue retrieving the metadata.
   * @example
   * const { width, height, duration } = await getVideoMetadata(videoPath)
   */
  async getVideoMetadata(videoPath) {
    return new Promise((resolve, reject) => {
      const command = `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -show_entries format=duration -of json "${videoPath}"`

      exec(command, (error, stdout, stderr) => {
        if (error) {
          if (stderr.includes('No such file or directory')) {
            return reject(new Error(`File not found: ${videoPath}`))
          }
          return reject(new Error(`Error getting metadata: ${error.message}`))
        }

        try {
          const parsed = JSON.parse(stdout)
          const { width, height } = parsed.streams[0]
          const duration = parseFloat(parsed.format.duration)
          this.width = width
          this.height = height
          this.duration = duration

          logger('## ~ meta:', this.width, this.height, this.duration)

          resolve({ width, height, duration })
        } catch (err) {
          reject(new Error(`Error parsing ffprobe output: ${err.message}`))
        }
      })
    })
  }

  /**
   * Detects scene highlights in the video based on a scene change threshold.
   * @param {number} [threshold=0.3] - The threshold for detecting scene changes (default is 0.3).
   * @returns {Promise<number[]>} - A promise that resolves to an array of timestamps (in seconds) where scene changes occur.
   */
  async getSceneHighlights(threshold = 0.1) {
    return new Promise((resolve) => {
      const command = `ffmpeg -loglevel info -i "${this.videoPath}" -vf "select='gt(scene\\,${threshold})',showinfo" -an -f null - 2>&1`
      exec(command, (error, stdout, stderr) => {
        if (error && !stderr.includes('frame=')) {
          console.error(`Error executing ffmpeg: ${error.message}`)

          return resolve([])
        }

        const output = stdout + stderr
        const regex = /pts_time:([0-9\.]+)/g
        let match,
          timestamps = []
        while ((match = regex.exec(output)) !== null) {
          timestamps.push(parseFloat(match[1]))
        }
        logger('## ~ ffmpeg Highlighter  ~ timestamps:', timestamps)
        resolve(timestamps)
      })
    })
  }

  /**
   * Extracts a video segment from the video file.
   * @param {Object} options - The options for extracting the segment.
   * @param {number} options.startTime - The start time of the segment in seconds.
   * @param {number} options.duration - The duration of the segment in seconds.
   * @param {string} options.outputFile - The path to save the extracted segment.
   * @returns {Promise<string>} - A promise that resolves to the path of the extracted video segment.
   * @throws {Error} - Throws an error if the segment extraction fails.
   */
  async extractVideoSegment({ startTime, duration, outputFile }) {
    return new Promise((resolve, reject) => {
      const command = `ffmpeg -ss ${startTime} -i "${this.videoPath}" -t ${duration} -c copy "${outputFile}"`
      exec(command, (error) => {
        if (error) {
          console.error(`Error extracting segment: ${error.message}`)
          return reject(error)
        }
        resolve(outputFile)
      })
    })
  }

  /**
   * Concatenates multiple video segments into a single video file.
   * @param {string[]} segmentFiles - An array of file paths for the video segments to concatenate.
   * @param {string} outputFile - The path to save the concatenated video file.
   * @returns {Promise<string>} - A promise that resolves to the path of the concatenated video file.
   * @throws {Error} - Throws an error if the concatenation process fails.
   */
  async concatenateSegments(segmentFiles, outputFile) {
    return new Promise((resolve, reject) => {
      const fileListContent = segmentFiles
        .map((file) => `file '${file}'`)
        .join('\n')
      const listFile = 'filelist.txt'
      fs.writeFileSync(listFile, fileListContent)
      const command = `ffmpeg -f concat -safe 0 -i "${listFile}" -c copy "${outputFile}"`
      exec(command, (error) => {
        if (error) {
          console.error(`Error concatenating segments: ${error.message}`)
          return reject(error)
        }
        fs.unlinkSync(listFile) // Clean up temporary file
        resolve(outputFile)
      })
    })
  }

  /**
   * Generates a thumbnail image from the video at a specific timestamp.
   * @param {number|string} timestamp - The timestamp (in seconds or as a time string) for the thumbnail.
   * @param {string} thumbnailPath - The path to save the generated thumbnail image.
   * @returns {Promise<string>} - A promise that resolves to the path of the generated thumbnail image.
   * @throws {Error} - Throws an error if the thumbnail generation fails.
   */
  async generateThumbnail(videoPath, timestamp, thumbnailPath) {
    return new Promise((resolve, reject) => {
      const command = `ffmpeg -i "${videoPath}" -ss ${timestamp} -vframes 1 "${thumbnailPath}"`
      exec(command, (error) => {
        if (error) {
          console.error(`Error generating thumbnail: ${error.message}`)
          return reject(error)
        }
        resolve(thumbnailPath)
      })
    })
  }

  /**
   * Crops the video to a reel aspect ratio (9:16).
   * @param {string} videoPath - The path to the input video file.
   * @param {string} outputFile - The path to save the cropped video file.
   * @returns {Promise<string>} - A promise that resolves to the path of the cropped video file.
   * @throws {Error} - Throws an error if the cropping process fails.
   * @example
   * const croppedVideo = await cropVideoToReelAspect(videoPath, outputFile)
   */
  async cropVideoToReelAspect(videoPath, outputFile) {
    return new Promise((resolve, reject) => {
      const inputAspect = this.width / this.height
      const reelAspect = 9 / 16

      let cropWidth, cropHeight

      if (inputAspect > reelAspect) {
        // Too wide → crop sides
        cropHeight = this.height
        cropWidth = Math.floor(cropHeight * reelAspect)
      } else {
        // Too tall → crop top/bottom
        cropWidth = this.width
        cropHeight = Math.floor(cropWidth / reelAspect)
      }

      const x = Math.floor((this.width - cropWidth) / 2)
      const y = Math.floor((this.height - cropHeight) / 2)

      const cropCommand = `ffmpeg -i "${videoPath}" -filter:v "crop=${cropWidth}:${cropHeight}:${x}:${y}" -c:a copy "${outputFile}"`

      exec(cropCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error cropping video: ${error.message}`)
          return reject(error)
        }
        resolve(outputFile)
      })
    })
  }

  /**
   * Generates a highlight video by extracting key scenes, concatenating them, and creating a thumbnail.
   * @returns {Promise<Object>} - A promise that resolves to an object containing the paths of the final video and thumbnail.
   * @throws {Error} - Throws an error if the highlight generation process fails.
   */
  async highlight() {
    try {
      const highlights = await this.getSceneHighlights()
      const highlightsConfig = [
        {
          startTime: highlights[0] ? highlights[0] - 3 : 3,
          duration: 10,
        },
        {
          startTime: highlights[1] ? highlights[1] - 3 : 13,
          duration: 10,
        },
        {
          startTime: highlights[2] ? highlights[2] - 3 : 23,
          duration: 10,
        },
      ]
      // if (highlights.length < 3) {
      //   // add values to fill the array to 3
      //   const diff = 3 - highlights.length
      //   const lastHighlight = highlights[highlights.length - 1]
      //   for (let i = 0; i < diff; i++) {
      //     highlights.push(lastHighlight + (i + 1) * 2)
      //   }
      //   throw new Error('Not enough highlights detected.')
      // }

      // Ensure the streams directory exists
      if (!fs.existsSync('./streams')) {
        fs.mkdirSync('./streams', { recursive: true })
      }

      const segments = []
      for (let i = 0; i < highlightsConfig.length; i++) {
        const segment = await this.extractVideoSegment({
          startTime: highlightsConfig[i].startTime,
          duration: highlightsConfig[i].duration,
          outputFile: `./streams/${this.outputName}_extracted${i + 1}.mp4`,
        })
        segments.push(segment)
      }

      const finalOutput = `./streams/${this.outputName}_final_output.mp4`
      await this.concatenateSegments(segments, finalOutput)

      const thumbnailPath = `./streams/${this.outputName}_thumbnail.jpg`
      await this.generateThumbnail(finalOutput, '00:00:01.000', thumbnailPath)

      const croppedVideoPath = `./streams/${this.outputName}_cropped.mp4`
      await this.cropVideoToReelAspect(finalOutput, croppedVideoPath)

      const croppedThumbnailPath = `./streams/${this.outputName}_croppedThumbnail.jpg`
      await this.generateThumbnail(
        croppedVideoPath,
        '00:00:01.000',
        croppedThumbnailPath
      )

      return {
        finalVideo: finalOutput,
        thumbnail: thumbnailPath,
        croppedVideo: croppedVideoPath,
        croppedThumbnail: croppedThumbnailPath,
      }
    } catch (error) {
      console.error('Error during highlight generation:', error)
      throw error
    }
  }
}
