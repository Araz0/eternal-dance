const fs = require('fs')
const axios = require('axios')
const FormData = require('form-data')

const BASE_URL = 'https://eternal-dance.art/exps'

// Example usage:
// uploadVideo('./1740507935180.mp4')
async function uploadVideo(videoPath) {
  // Create a new form and append the video file stream.
  const form = new FormData()
  form.append('video', fs.createReadStream(videoPath))

  try {
    // Make the POST request with the form data.
    const response = await axios.post(BASE_URL + '/upload.php', form, {
      headers: {
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })
    console.log('Upload successful:', response.data)
    return BASE_URL + `/uploads/${response.data.file}`
  } catch (error) {
    // Log detailed error information.
    console.error(
      'Error uploading video:',
      error.response ? error.response.data : error.message
    )
  }
}

module.exports = {
  uploadVideo,
}
