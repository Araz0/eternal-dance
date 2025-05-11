import dgram from 'dgram'
import { logger } from './utils/logger.js'

export class UDPServer {
  constructor(ip, port) {
    this.ip = ip
    this.port = port
    this.server = dgram.createSocket('udp4')
    this.currentValue = null
    this.callback = null

    logger(`Creating UDP server on ${this.ip}:${this.port}`)

    // Set up event listeners
    this.server.on('message', (msg, rinfo) => this.handleMessage(msg, rinfo))
    this.server.on('listening', () => this.handleListening())
    this.server.on('error', (err) => this.handleError(err))
  }

  handleMessage(msg, rinfo) {
    const strMessage = msg.toString().trim()
    logger(
      `Received message from ${rinfo.address}:${rinfo.port} ->`,
      strMessage
    )

    this.currentValue = strMessage
    if (this.callback) {
      this.callback(this.currentValue)
    }
  }

  handleListening() {
    const address = this.server.address()
    logger(`UDP server listening on ${address.address}:${address.port}`)
  }

  handleError(err) {
    console.error('UDP Server Error:\n', err)
    this.server.close()
  }

  start() {
    this.server.bind(this.port, this.ip)
    logger(`UDP server bound to ${this.ip}:${this.port}`)
  }

  stop() {
    this.server.close(() => {
      logger('UDP server stopped.')
    })
  }

  onCallback(callback) {
    this.callback = callback
  }
}
