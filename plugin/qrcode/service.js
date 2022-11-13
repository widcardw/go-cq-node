const fs = require('fs')
const path = require('path')
const os = require('os')
const qr = require('qr-image')

async function getImage(text) {
  return new Promise((resolve) => {
    const filename = path.join(
      os.tmpdir(),
      `go-cqhttp-node-qrcode-${Date.now()}.png`,
    )
    const stream = fs.createWriteStream(filename)
    qr.image(text, {
      type: 'png',
      size: 10,
      margin: 2,
    }).pipe(stream)
    stream.on('finish', () =>
      resolve([
        {
          type: 'image',
          data: {
            file: `file://${filename}`,
          },
        },
      ]),
    )
    stream.on('error', (err) => {
      console.error('[qrcode]', err)
      resolve([
        {
          type: 'text',
          data: {
            text: '生成二维码失败',
          },
        },
      ])
    })
  })
}

module.exports = {
  getImage,
}
