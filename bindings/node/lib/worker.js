'use strict'

// A render worker: renders each document the pool sends on this thread, and sends back the PDF,
// moved rather than copied, or the error.

const { parentPort } = require('node:worker_threads')
const { renderBytes } = require('./render')

parentPort.on('message', ({ html, options }) => {
  let reply
  let transfer
  try {
    reply = renderBytes(html, options)
    transfer = [reply.pdf]
  } catch (error) {
    const kind = error.kind ?? (error instanceof TypeError ? 'invalid_argument' : 'internal')
    reply = { error: { kind, message: error.message } }
  }
  parentPort.postMessage(reply, transfer)
})
