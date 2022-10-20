const fs = require('fs')
const path = require('path')

// Get root and extender dir
const rootDir = path.dirname(__dirname)
const srcDir = path.join(rootDir, 'src')
const scriptsDir = path.join(srcDir, 'scripts')
const stylesDir = path.join(srcDir, 'styles')


module.exports = function () {
  const entrypoints = {}

  fs.readdirSync(stylesDir).forEach((file) => {
    const extenderName = path.parse(file).name
    if (!extenderName.startsWith('_')) {
      entrypoints[`${extenderName}`] = []
      entrypoints[`${extenderName}`].push(
        path.join(stylesDir, `${extenderName}.scss`)
      )
    }
  })

  fs.readdirSync(scriptsDir).forEach((file) => {
    const extenderName = path.parse(file).name
    const extenderFile = path.join(scriptsDir, `${extenderName}.js`)

    if (fs.existsSync(extenderFile)) {
      if (!entrypoints.hasOwnProperty(`${extenderName}`)) {
        entrypoints[`${extenderName}`] = []
      }

      entrypoints[`${extenderName}`].push(
        path.join(scriptsDir, `${extenderName}.js`)
      )
    }
  })

  return entrypoints
}
