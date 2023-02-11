import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { Resvg } from '@resvg/resvg-js'

async function toPng(svg: string) {
  svg = svg.match(/<svg(.*)<\/svg>/)![0]
  const resvg = new Resvg(svg, {
    background: 'rgb(255,255,255)',
    fitTo: {
      mode: 'height',
      value: 100,
    },
  })
  const buffer = resvg.render().asPng()
  const filename = path.join(
    os.tmpdir(),
    `go-cqhttp-node-ts-qrcode-${Date.now()}.png`,
  )
  await fs.writeFile(filename, buffer)
  return filename
}

export {
  toPng,
}
