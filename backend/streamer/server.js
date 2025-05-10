import { WebSocketServer } from 'ws'
import { startSession } from './session.js'

const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', (ws) => {
  console.log('TouchDesigner State connected')
  ws.on('message', (msg) => {
    const data = JSON.parse(msg)
    if (data.current_state != undefined) {
      console.log(data)
    }
    // console.log('Received JSON:', JSON.parse(msg))
    // You can JSON.parse(msg) here and use it
  })
})

const wss3 = new WebSocketServer({ port: 8081 })

wss3.on('connection', (ws) => {
  console.log('TouchDesigner Elapsed Timer connected')
  ws.on('message', (msg) => {
    const data = JSON.parse(msg)
    console.log(data)
    // console.log('Received JSON:', JSON.parse(msg))
    // You can JSON.parse(msg) here and use it
  })
})
