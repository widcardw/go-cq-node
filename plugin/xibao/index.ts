import fs from 'fs'
import path from 'path'
import os from 'os'
import type { CanvasRenderingContext2D } from 'canvas'
import { createCanvas, loadImage, registerFont } from 'canvas'
import { definePlugin } from '../../utils/define-plugin'
import type { ImageMessage } from '../../types'
import { isGroup, isPrivate } from '../../types'

const pattern = /^\/喜报 ([\s\S]+)$/
const width = 650
const height = 487

let interval: NodeJS.Timer
let notAbleToSend = false

export default (validGroups?: number[]) => definePlugin({
  name: '喜报',
  desc: '生成喜报图片',
  async setup({ data, ws }) {
    if (!data.message)
      return
    try {
      if (isPrivate(data)) {
        const match = data.message.match(pattern)
        if (!match)
          return

        if (notAbleToSend)
          throw new Error('你先别急')

        const textContent = match[1]

        ws.send('send_private_msg', {
          user_id: data.user_id,
          message: await service(textContent),
        })
      }
      else if (isGroup(data)) {
        if (validGroups?.length && !validGroups.includes(data.group_id))
          return

        const match = data.message.match(pattern)
        if (!match)
          return

        if (notAbleToSend)
          throw new Error('你先别急')

        const textContent = match[1]
        if (!/[\u4E00-\u9FA5]|[A-Za-z\d]/g.test(textContent)
          || textContent.includes('[CQ:at')
          || textContent.includes('[CQ:face'))
          throw new Error('请不要乱写谢谢')

        if (textContent.includes('CQ:image'))
          throw new Error('目前不支持图片')

        ws.send('send_group_msg', {
          group_id: data.group_id,
          message: await service(textContent),
        })
      }
      notAbleToSend = true
      interval = setTimeout(() => {
        clearInterval(interval)
        notAbleToSend = false
      }, 5000)
    }
    catch (e: any) {
      if (isGroup(data)) {
        ws.send('send_group_msg', {
          group_id: data.group_id,
          message: e.message || String(e),
        })
      }
      else if (isPrivate(data)) {
        ws.send('send_private_msg', {
          user_id: data.user_id,
          message: e.message || String(e),
        })
      }
    }
  },
})

function getFontSize(text: string, ctx: CanvasRenderingContext2D) {
  const slices = text.split('\n')
  let maxFontSize = 99999
  for (const s of slices) {
    const w = ctx.measureText(s).width
    const tempSize = (width - 20) / w * 56
    if (tempSize < maxFontSize)
      maxFontSize = tempSize
  }
  if (maxFontSize > 56)
    maxFontSize = 56
  if (maxFontSize < 10)
    maxFontSize = 10
  return maxFontSize
}

function assumePosition(text: string, ctx: CanvasRenderingContext2D, fontSize: number) {
  const slices = text.split('\n')
  const x: number[] = []
  const y: number[] = []
  for (let i = 0; i < slices.length; i++) {
    x.push(width / 2 - ctx.measureText(slices[i]).width / 2)
    y.push(height / 2 - fontSize * slices.length / 2 + fontSize * (i + 1))
  }
  return { x, y, fontSize, slices }
}

export async function service(text: string): Promise<ImageMessage> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    const filename = path.join(
      os.tmpdir(),
        `go-cqhttp-node-ts-xibao-${Date.now()}.png`,
    )
    const out = fs.createWriteStream(filename)

    registerFont('./plugin/xibao/assets/HanYiZhongLiShuJian-1.ttf', {
      family: 'HanYiZhongLiShuJian-1',
    })

    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    const img = await loadImage('./plugin/xibao/assets/xi.png')
    ctx.drawImage(img, 0, 0)

    ctx.font = '56px HanYiZhongLiShuJian-1'

    const fontSize = getFontSize(text, ctx)

    const fixed = fontSize.toFixed(0)

    ctx.font = `${fixed}px HanYiZhongLiShuJian-1`

    const { x, y, slices } = assumePosition(text, ctx, fontSize)

    for (let i = 0; i < slices.length; i++)
      ctx.fillText(slices[i], x[i], y[i])

    const stream = canvas.createPNGStream()

    stream.pipe(out)

    out.on('finish', () => {
      resolve({
        type: 'image',
        data: { file: `file://${filename}` },
      })
    })
  })
}
