import { WebSocketServer } from 'ws'
import { Session } from './session.js'
import { logger } from './utils/logger.js'

const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', (ws) => {
  logger('TouchDesigner State connected')
  const session = new Session()

  ws.on('message', async (msg) => {
    const data = JSON.parse(msg)

    if (data.current_state != undefined && data.id != undefined) {
      logger(data)
      if (data.current_state === 1) {
        const totalRecordingtime = data.duration1 + data.duration2 || 180
        const values = await session.startRecording(totalRecordingtime, data.id)

        logger('## ~ ws.on ~ values:', values)
      } else if (data.current_state === 0) {
        session.cancelRecording(data.current_state)
      } else if (data.current_state === 2) {
        logger('Ignoring current_state: 2 during active recording')
      } else if (data.current_state === 3) {
        logger('Ignoring current_state: 3 during active recording')
      }
    } else {
      logger(
        'Error with data from TD. current_state or id is undefined. Data:',
        data
      )
    }
  })
})

// use this incase you like to share the current status in a progressbar or something in a UI
const wss3 = new WebSocketServer({ port: 8081 })

wss3.on('connection', (ws) => {
  logger('TouchDesigner Elapsed Timer connected')
  ws.on('message', (msg) => {
    const data = JSON.parse(msg)
    logger(data)
    // logger('Received JSON:', JSON.parse(msg))
    // You can JSON.parse(msg) here and use it
  })
})
