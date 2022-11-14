import fs from 'fs'
import path from 'path'
import os from 'os'
import qr from 'qr-image'
import type { ImageMessage, TextMessage } from '../../types'

export async function getImage(text: string): Promise<ImageMessage[] | TextMessage[]> {
  return new Promise((resolve) => {
    const filename = path.join(
      os.tmpdir(),
            `go-cqhttp-node-ts-qrcode-${Date.now()}.png`,
    )
    const stream = fs.createWriteStream(filename)
    qr.image(text, {
      type: 'png',
      size: 10,
      margin: 2,
    }).pipe(stream)

    stream.on('finish', () => {
      resolve([{
        type: 'image',
        data: { file: `file://${filename}` },
      }])
    })

    stream.on('error', (err) => {
      console.error('[qrcode]', err)
      resolve([
        { type: 'text', data: { text: '生成二维码失败' } },
      ])
    })
  })
}
