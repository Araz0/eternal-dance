import { WebSocketServer } from 'ws'
import { logger } from './utils/logger.js'

const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', (ws) => {
  logger('TouchDesigner State connected')
  ws.on('message', (msg) => {
    const data = JSON.parse(msg)
    if (data.current_state != undefined) {
      logger(data)
    }
    // logger('Received JSON:', JSON.parse(msg))
    // You can JSON.parse(msg) here and use it
  })
})

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
