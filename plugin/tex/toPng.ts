import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { Resvg } from '@resvg/resvg-js'

function addPadding(svg: string): string {
  return svg.replace(/viewBox="([^"]*)"/, (_match, $1: string) => {
    const viewBox = $1.split(' ')
      .map(parseFloat)
      .map((x, i) => i < 2 ? x - 100 : x + 200)
      .join(' ')
    return `viewBox="${viewBox}"`
  })
}

async function toPng(svg: string) {
  svg = svg.match(/<svg(.*)<\/svg>/)![0]
  svg = addPadding(svg)
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
