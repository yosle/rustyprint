'use strict'

const fs = require('node:fs')
const path = require('node:path')

const REPO = path.resolve(__dirname, '../../..')

// A paragraph to repeat for documents that take a while to render.
const LOREM = '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>'

// The page sizes of a PDF in points, from its /MediaBox entries.
function pageSizes (pdf) {
  return [...pdf.toString('latin1').matchAll(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/g)]
    .map(([, width, height]) => [round(width), round(height)])
}

function round (value) {
  return Math.round(Number(value) * 10) / 10
}

// The sample invoice and its assets.
function invoice () {
  const dir = path.join(REPO, 'demos/samples/invoice')
  return {
    html: fs.readFileSync(path.join(dir, 'index.html'), 'utf8'),
    assets: {
      'invoice.css': fs.readFileSync(path.join(dir, 'invoice.css')),
      'logo.png': fs.readFileSync(path.join(dir, 'logo.png'))
    }
  }
}

module.exports = { REPO, LOREM, pageSizes, invoice }
