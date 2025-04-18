import { exec } from 'child_process'
import fs from 'fs'

/**
 * todo: add coverage incase there is not enough highlights
 */

const VIDEO_PATH = '.\\streams\\3min.mp4'
const outputName = Date.now()

/**
 * Get video duration in seconds using ffprobe.
 */
function getVideoDuration(videoPath) {
  return new Promise((resolve, reject) => {
    const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`
    exec(command, (error, stdout, stderr) => {
      if (error) {
        if (stderr.includes('No such file or directory')) {
          return reject(new Error(`File not found: ${videoPath}`))
        }
        return reject(new Error(`Error getting duration: ${error.message}`))
      }
      const duration = parseInt(stdout)
      resolve(duration)
    })
  })
}

// const duration = await getVideoDuration(VIDEO_PATH)
// console.log(`Video duration: ${duration} seconds`)

/**
 * Get video width, height, and duration using a single ffprobe call.
 */
function getVideoMetadata(videoPath) {
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
        resolve({ width, height, duration })
      } catch (err) {
        reject(new Error(`Error parsing ffprobe output: ${err.message}`))
      }
    })
  })
}

const { width, height, duration } = await getVideoMetadata(VIDEO_PATH)
console.log(`Video width: ${width}, height: ${height}, duration: ${duration}`)
/**
 * Run ffmpeg scene detection on the video and return candidate highlight timestamps.
 * Note: The lower the threshold, the more sensitive the detection.
 * Note: ffmpeg’s -f null output returns a non-zero exit code so we parse stderr.
 */
function getSceneHighlights(videoPath, threshold = 0.3) {
  return new Promise((resolve) => {
    // Escape the comma in the scene filter
    const command = `ffmpeg -loglevel info -i "${videoPath}" -vf "select='gt(scene\,${threshold})',showinfo" -an -f null - 2>&1`
    exec(command, (error, stdout, stderr) => {
      if (error && !stderr.includes('frame=')) {
        console.error(`Error executing ffmpeg: ${error.message}`)
        return resolve([]) // Return an empty array if there's an error
      }

      const output = stdout + stderr // Combine stdout and stderr for parsing

      // The showinfo filter logs lines with pts_time. We extract all timestamps.
      const regex = /pts_time:([0-9\.]+)/g
      let match,
        timestamps = []
      while ((match = regex.exec(output)) !== null) {
        timestamps.push(parseFloat(match[1]))
      }
      resolve(timestamps)
    })
  })
}

const highlights = await getSceneHighlights(VIDEO_PATH)
console.log(`Found ${highlights.length} highlights`)
console.log(highlights)

/**
 * Extract a segment of the given length starting at startTime using ffmpeg.
 */
function extractVideoSegment({ videoPath, startTime, duration, outputFile }) {
  return new Promise((resolve, reject) => {
    const command = `ffmpeg -ss ${startTime} -i "${videoPath}" -t ${duration} -c copy "${outputFile}"`
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error extracting segment: ${error.message}`)
        return reject(error)
      }
      resolve(outputFile)
    })
  })
}

const extractedVideo1 = await extractVideoSegment({
  videoPath: VIDEO_PATH,
  startTime: highlights[0] - 3, // Start 3 seconds before the highlight
  duration: 10, // 10 seconds
  outputFile: outputName + '_extracted.mp4',
})
console.log('## ~ extractedVideo:', extractedVideo1)

const extractedVideo2 = await extractVideoSegment({
  videoPath: VIDEO_PATH,
  startTime: highlights[1] - 3, // Start 3 seconds before the highlight
  duration: 10, // 10 seconds
  outputFile: outputName + '_extracted2.mp4',
})
console.log('## ~ extractedVideo:', extractedVideo2)

const extractedVideo3 = await extractVideoSegment({
  videoPath: VIDEO_PATH,
  startTime: highlights[2] - 3, // Start 3 seconds before the highlight
  duration: 10, // 10 seconds
  outputFile: outputName + '_extracted3.mp4',
})
console.log('## ~ extractedVideo:', extractedVideo3)

/**
 * Concatenate the array of video segment files into a single video.
 */
function concatenateSegments(segmentFiles, outputFile) {
  return new Promise((resolve, reject) => {
    // Create a temporary file list for ffmpeg concat demuxer.
    const fileListContent = segmentFiles
      .map((file) => `file '${file}'`)
      .join('\n')
    const listFile = 'filelist.txt'
    fs.writeFileSync(listFile, fileListContent)
    const command = `ffmpeg -f concat -safe 0 -i "${listFile}" -c copy "${outputFile}"`
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error concatenating segments: ${error.message}`)
        return reject(error)
      }
      //   fs.unlinkSync(listFile) // Clean up temporary file
      resolve(outputFile)
    })
  })
}

const segmentFiles = [extractedVideo1, extractedVideo2, extractedVideo3]
console.log('## ~ segmentFiles:', segmentFiles)

const outputFile = outputName + '_final_output.mp4'
const finalVideo = await concatenateSegments(segmentFiles, outputFile)
console.log('## ~ finalVideo:', finalVideo)

/**
 * Generate a thumbnail from the video.
 * Note: The timestamp is in the format hh:mm:ss.ms.
 */
function generateThumbnail(videoPath, timestamp, thumbnailPath) {
  return new Promise((resolve, reject) => {
    const command = `ffmpeg -i "${videoPath}" -ss ${timestamp} -vframes 1 "${thumbnailPath}"`
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error generating thumbnail: ${error.message}`)
        return reject(error)
      }
      resolve(thumbnailPath)
    })
  })
}

const thumbnailPath = outputName + '_thumbnail.jpg'
const thumbnail = await generateThumbnail(
  finalVideo,
  '00:00:01.000',
  thumbnailPath
)
console.log('## ~ thumbnail:', thumbnail)

function cropVideoToReelAspect({ videoPath, outputFile }) {
  return new Promise((resolve, reject) => {
    // We'll first detect the input video resolution using ffprobe
    const probeCommand = `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${videoPath}"`

    exec(probeCommand, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error probing video: ${err.message}`)
        return reject(err)
      }

      const [inputWidth, inputHeight] = stdout.trim().split(',').map(Number)
      const inputAspect = inputWidth / inputHeight
      const reelAspect = 9 / 16

      let cropWidth, cropHeight

      if (inputAspect > reelAspect) {
        // Too wide → crop sides
        cropHeight = inputHeight
        cropWidth = Math.floor(cropHeight * reelAspect)
      } else {
        // Too tall → crop top/bottom
        cropWidth = inputWidth
        cropHeight = Math.floor(cropWidth / reelAspect)
      }

      const x = Math.floor((inputWidth - cropWidth) / 2)
      const y = Math.floor((inputHeight - cropHeight) / 2)

      const cropCommand = `ffmpeg -i "${videoPath}" -filter:v "crop=${cropWidth}:${cropHeight}:${x}:${y}" -c:a copy "${outputFile}"`

      exec(cropCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error cropping video: ${error.message}`)
          return reject(error)
        }
        resolve(outputFile)
      })
    })
  })
}

const croppedVideoPath = outputName + '_cropped.mp4'
const croppedVideo = await cropVideoToReelAspect({
  videoPath: finalVideo,
  outputFile: croppedVideoPath,
})
console.log('## ~ croppedVideo:', croppedVideo)
