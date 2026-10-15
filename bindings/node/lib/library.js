'use strict'

const path = require('node:path')

// The native library's file name on this platform.
function fileName () {
  switch (process.platform) {
    case 'win32': return 'rustyprint_ffi.dll'
    case 'darwin': return 'librustyprint_ffi.dylib'
    default: return 'librustyprint_ffi.so'
  }
}

// The directory the package keeps its copy of the library in, which `npm run compile` fills.
const NATIVE_DIR = path.join(__dirname, '..', 'native')

// Where the library is: RUSTYPRINT_LIBRARY if set, else the copy in the package.
function libraryPath () {
  return process.env.RUSTYPRINT_LIBRARY || path.join(NATIVE_DIR, fileName())
}

module.exports = { fileName, libraryPath, NATIVE_DIR }
