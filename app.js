'use strict'

const express = require('express')
const fs = require('fs')
const path = require('path')
const urlencode = require('urlencode')

var app = express()

exports.mapPaths = (callback, actualPath = '/') => {
  let concatedPath = path.join(process.argv[3], actualPath)

  app.use(actualPath, express.static(concatedPath))

  app.get((actualPath), (req, res) => {
    res.charset = 'utf8'
    res.type('text/html')
    
    let decodedPath = urlencode.decode(concatedPath)

    fs.readdir(decodedPath, (err, files) => {
      if (err) {
        res.status(500).end('<h1>The server couldn\'t read the files</h1>')
      } else {
        var html = '<ul>'

        files.forEach(fileName => {
          let isFolder = fs.lstatSync(path.join(decodedPath, fileName)).isDirectory()

          if (isFolder) {
            exports.mapPaths(callback, `${actualPath}${urlencode(fileName)}/`)
          }

          html += `<li><a href="${path.join(actualPath, fileName)}">${fileName}${isFolder ? '/' : ''}</a></li>`
        })

        res.end(html += '</ul>', callback)
      }
    })
  })
}

app.listen(process.argv[2], () => {
  exports.mapPaths(() => {
    console.info('Some folder was accessed')
  })

  console.info('The paths have been successfully added!')
  console.info(`The server is running on port ${process.argv[2]}`)
})