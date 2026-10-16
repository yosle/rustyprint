'use strict'

// Renders every sample in demos/samples to a PDF, all at once through render(), with each
// sample's files as assets by the path its HTML uses, as the Ruby and .NET demos do. Writes the
// PDFs to the directory given, or samples/ here, and prints a Markdown table of what each took.

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const { render, nativeVersion } = require('..')

const SAMPLES = path.resolve(__dirname, '../../../demos/samples')
const out = path.resolve(process.argv[2] ?? 'samples')

// Every file of a sample but its index.html, by its path from the sample's directory.
function assetsOf (dir) {
  const assets = {}
  for (const entry of fs.readdirSync(dir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue
    const file = path.join(entry.parentPath, entry.name)
    const name = path.relative(dir, file).split(path.sep).join('/')
    if (name !== 'index.html') assets[name] = fs.readFileSync(file)
  }
  return assets
}

async function renderSample (name) {
  const dir = path.join(SAMPLES, name)
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8')
  const started = performance.now()
  const { pdf, warnings } = await render(html, { assets: assetsOf(dir) })
  const ms = performance.now() - started
  fs.writeFileSync(path.join(out, `${name}.pdf`), pdf)
  return {
    name,
    ms,
    pages: (pdf.toString('latin1').match(/\/MediaBox \[/g) ?? []).length,
    kb: pdf.length / 1024,
    sha256: crypto.createHash('sha256').update(pdf).digest('hex'),
    warnings
  }
}

async function main () {
  fs.mkdirSync(out, { recursive: true })
  const names = fs.readdirSync(SAMPLES, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name)

  const started = performance.now()
  const results = await Promise.all(names.map(renderSample))
  const total = performance.now() - started

  console.log(`rustyprint ${nativeVersion()}, Node.js ${process.version}, ${process.platform}-${process.arch}`)
  console.log()
  console.log('| Sample | Pages | Size | Render | SHA-256 | Warnings |')
  console.log('| --- | ---: | ---: | ---: | --- | --- |')
  for (const r of results) {
    const warnings = r.warnings.length > 0 ? r.warnings.join('; ').replaceAll('|', '\\|') : 'none'
    console.log(`| ${r.name} | ${r.pages} | ${r.kb.toFixed(0)} KB | ${r.ms.toFixed(0)} ms | \`${r.sha256.slice(0, 16)}\` | ${warnings} |`)
  }
  console.log()
  console.log(`All ${results.length} rendered at once in ${total.toFixed(0)} ms.`)

  fs.writeFileSync(path.join(out, 'sha256.txt'), results.map(r => `${r.sha256}  ${r.name}.pdf`).join('\n') + '\n')
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
