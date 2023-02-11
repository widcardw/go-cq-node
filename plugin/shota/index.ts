import { join } from 'path'
import axios from 'axios'
import fg from 'fast-glob'
import { nanoid } from 'nanoid'
import sharp from 'sharp'
import type { ImageMessage } from '../../types'
import { createTextMsg } from '../../types'
import { definePlugin } from '../../utils/define-plugin'
import type { MyWs } from '../../bot/ws'
import { wrapSend } from '../../utils/wrap-send'
let interval: NodeJS.Timer
let notAbleToSend = false
let cache: any = null

let pics: string[] = []
let scanned = false

function removeStar(path: string) {
  return path.replace('*', '')
}

const urlPattern = /\[CQ:image,file=([^\]]+?),url=([^\]]+?)\]/g
const singlePicPattern = /\[CQ:image,file=([^\]]+?),url=([^\]]+?)\]$/
const replySavePattern = /^\[CQ:reply,id=([-\d]+)\][\s\S]*shota save$/

async function scanPics(path: string | string[]) {
  pics = await fg(path, { absolute: true })
  scanned = true
}

function getReplyMessage(savedPics: string[], existPics: string[]): string {
  let replyMessage = ''
  if (savedPics.length > 0)
    replyMessage += `已保存 ${savedPics.join('\n')}`
  if (replyMessage !== '' && existPics.length > 0)
    replyMessage += `\n\n${existPics.join('\n')} 已存在`
  if (replyMessage.trim() === '')
    replyMessage = '什么都没保存捏'
  return replyMessage
}

function getImage(): ImageMessage {
  const len = pics.length
  const rand = Math.floor(len * Math.random())
  return {
    type: 'image',
    data: {
      file: `file://${pics[rand]}`,
    },
  }
}

async function sharpPicture(buffer: Buffer, absPath: string): Promise<sharp.OutputInfo> {
  return new Promise((resolve, reject) => {
    sharp(Buffer.from(buffer))
      .webp({ quality: 60 })
      .toFile(absPath, (err, info) => {
        if (err)
          reject(info)
        else
          resolve(info)
      })
  })
}

async function savePics(message: string, assetPath: string): Promise<[string[], string[]]> {
  const matches = message.match(urlPattern)
  if (!matches)
    return Promise.reject(new Error('没有检测到图片'))
  const urls = matches.map((s) => {
    return s.match(singlePicPattern)?.[2]
  }).filter(Boolean) as string[]
  console.warn(urls)

  const res = (await Promise.allSettled(urls.map(async (url) => {
    // get the hash id
    const splits = url.split('/')
    let name = splits[5].split('-')[2]
    if (!name)
      name = splits[6].split('-')[2]
    if (!name)
      name = nanoid(13)
    const filename = `${name}.webp`
    // find if it is already in picture list
    const found = pics.find(it => it.includes(filename))
    if (found) {
      console.warn(`图片 ${filename} 已存在`)
      throw new Error(filename)
    }

    // fetch the picture data
    const response = await axios({ url, responseType: 'arraybuffer' })
    const absPath = join(removeStar(assetPath), filename)
    // await fsp.writeFile(absPath, response.data)
    await sharpPicture(response.data, absPath)
    return filename
  })))

  const existPics = res
    .filter(it => it.status === 'rejected')
    .map(it => (it as any).reason.message)
  const savedPics = res
    .filter(it => it.status === 'fulfilled')
    .map(it => (it as any).value)

  savedPics.forEach((filename) => {
    pics.push(join(removeStar(assetPath), filename))
  })

  return [savedPics, existPics]
}

const plugin = (
  assetPath: string | string[],
  valid?: {
    validGroups?: number[]
    validGroupUsers?: number[]
    validPrivate?: number[]
  },
) => definePlugin({
  name: 'shota',
  desc: '发送正太图片',
  ...valid,
  async setup({ data, ws }) {
    const savePath = typeof assetPath === 'string' ? assetPath : assetPath[0]
    try {
      if (!scanned) {
        await scanPics(assetPath)
        console.warn('共 ', pics.length)
      }

      // @ts-expect-error type wrong
      if (data?.data?.message && cache) {
      // @ts-expect-error type wrong
        const message = data.data.message as string

        const [tempList, existPics] = await savePics(message, savePath)

        // reply
        const replyMessage = getReplyMessage(tempList, existPics)
        wrapSend(ws, cache, createTextMsg(replyMessage))
        cache = null
        return
      }

      if (!data.message)
        return

      const message = data.message.trim()

      if (/^(正太|shota) (刷新|refresh)$/i.test(message)) {
        await scanPics(assetPath)
        const m = `已刷新，共 ${pics.length} 张图片`
        throw new Error(m)
      }

      if (/^(正太|shota) (保存|save)([\s\S]+)?$/i.test(message)) {
        const [tempList, existPics] = await savePics(message, savePath)

        // reply
        const replyMessage = getReplyMessage(tempList, existPics)

        return createTextMsg(replyMessage)
      }

      if (replySavePattern.test(message)) {
        // console.warn('根据回复保存图片')
        const msg_id = Number(message.match(replySavePattern)![1])
        if (isNaN(msg_id))
          throw new Error('消息 ID 不合法')

        cache = data

        // console.warn(msg_id)
        ws.send('get_msg', { message_id: msg_id })
      }

      if (message !== '正太' && message !== 'shota')
        return

      if (notAbleToSend)
        throw new Error('你先别急')

      notAbleToSend = true
      interval = setTimeout(() => {
        clearInterval(interval)
        notAbleToSend = false
      }, 8000)
      return getImage()
    }
    catch (e: any) {
      if (cache) {
        wrapSend(ws, cache, createTextMsg(e.message || String(e)))
        cache = null
      }
      else {
        return e.message || String(e)
      }
    }
  },
})

export default plugin
