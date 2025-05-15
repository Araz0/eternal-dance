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

    console.log('## ~ Highlighter ~ initializeMetadata:', width, height)

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
      const inputW = this.width // e.g. 1920
      const inputH = this.height // e.g. 1080
      const reelAspect = 9 / 16

      let cropW, cropH
      if (inputW / inputH > reelAspect) {
        // too wide → crop sides
        cropH = inputH
        cropW = Math.floor(cropH * reelAspect)
      } else {
        // too tall → crop top/bottom (rare for landscape source)
        cropW = inputW
        cropH = Math.floor(cropW / reelAspect)
      }

      // make them even
      if (cropW % 2) cropW++
      if (cropH % 2) cropH++

      const x = Math.floor((inputW - cropW) / 2)
      const y = Math.floor((inputH - cropH) / 2)

      // crop, then scale back up to full-reel resolution
      const vf = `crop=${cropW}:${cropH}:${x}:${y},scale=1080:1920`

      const cmd = [
        `ffmpeg -i "${videoPath}"`,
        `-filter:v "${vf}"`,
        // `-c:v libx264 -crf 18 -preset veryfast`,
        `-c:a copy "${outputFile}"`,
      ].join(' ')

      exec(cmd, (err, stdout, stderr) => {
        if (err) return reject(err)
        resolve(outputFile)
      })
    })
  }
  s

  /**
   * Compute centered highlight segments within a total duration.
   *
   * @param {number} totalSec       – total duration, in seconds
   * @param {number[]} fractions    – array of fractional positions (e.g. [0.25, 0.5, 0.75])
   * @param {number} segmentLenSec  – length of each segment, in seconds
   * @returns {Array<{ startTime: number, duration: number }>}
   */
  computeCenteredHighlights(totalSec, fractions, segmentLenSec) {
    const halfLen = segmentLenSec / 2
    return fractions.map((frac) => {
      const center = totalSec * frac
      const start = Math.max(0, center - halfLen)
      return {
        startTime: start,
        duration: segmentLenSec,
      }
    })
  }

  /**
   * Generates a highlight video by extracting key scenes, concatenating them, and creating a thumbnail.
   * @returns {Promise<Object>} - A promise that resolves to an object containing the paths of the final video and thumbnail.
   * @throws {Error} - Throws an error if the highlight generation process fails.
   */
  async highlight(duration, withTransition = false) {
    let highlightsConfig = []

    if (withTransition) {
      highlightsConfig = this.computeCenteredHighlights(
        duration,
        [0.25, 0.5, 0.75],
        10
      )
    } else {
      highlightsConfig = this.computeCenteredHighlights(
        duration,
        [0.25, 0.75],
        15
      )
    }

    try {
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

      // const thumbnailPath = `./streams/${this.outputName}_thumbnail.jpg`
      // await this.generateThumbnail(finalOutput, '00:00:01.000', thumbnailPath)

      const reelVideoPath = `./streams/${this.outputName}_reel.mp4`
      await this.cropVideoToReelAspect(finalOutput, reelVideoPath)

      const thumbnailPath = `./streams/${this.outputName}_thumbnail.jpg`
      await this.generateThumbnail(reelVideoPath, '00:00:05.000', thumbnailPath)

      return {
        // finalVideo: finalOutput,
        // thumbnail: thumbnailPath,
        reelVideo: reelVideoPath,
        thumbnail: thumbnailPath,
      }
    } catch (error) {
      console.error('Error during highlight generation:', error)
      throw error
    }
  }
}
