import fs from 'fs'
import axios from 'axios'
import FormData from 'form-data'
import { logger } from './utils/logger.js'

const BASE_URL = 'https://api.eternal-dance.art'
const API_ENDPOINT = BASE_URL + '/api.php'
const UPLOAD_DIR = 'exps'

/**
 * Uploads a video file to a remote server.
 * @param {string} videoPath - The path to the video file to upload.
 * @return {Promise<string>} - The URL of the uploaded video.
 * @throws Will throw an error if the upload fails.
 * @example
 * uploadVideo('./path/to/video.mp4')
 *   .then(url => logger('Uploaded video URL:', url))
 */
export async function uploadVideo(videoPath) {
  // Create a new form and append the video file stream.
  const form = new FormData()
  form.append('video', fs.createReadStream(videoPath))

  try {
    // Make the POST request with the form data.
    const response = await axios.post(API_ENDPOINT, form, {
      headers: {
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })
    logger('Upload successful:', response.data)
    return `${BASE_URL}/${UPLOAD_DIR}/${response.data.file}`
  } catch (error) {
    // Log detailed error information.
    console.error(
      'Error uploading video:',
      error.response ? error.response.data : error.message
    )
  }
}

/**
 * Uploads an image file to a remote server.
 * @param {string} imagePath - The path to the image file to upload.
 * @return {Promise<string>} - The URL of the uploaded image.
 * @throws Will throw an error if the upload fails.
 * @example
 * uploadImage('./path/to/image.png')
 *  .then(url => logger('Uploaded image URL:', url))
 */
export async function uploadImage(imagePath) {
  // Create a new form and append the image file stream.
  const form = new FormData()
  form.append('image', fs.createReadStream(imagePath))

  try {
    // Make the POST request with the form data.
    const response = await axios.post(API_ENDPOINT, form, {
      headers: {
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })
    logger('Upload successful:', response.data)
    return `${BASE_URL}/${UPLOAD_DIR}/${response.data.file}`
  } catch (error) {
    // Log detailed error information.
    console.error(
      'Error uploading image:',
      error.response ? error.response.data : error.message
    )
  }
}
