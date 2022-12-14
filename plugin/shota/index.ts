import { join } from 'path'
import axios from 'axios'
import fg from 'fast-glob'
import { nanoid } from 'nanoid'
import sharp from 'sharp'
import type { ImageMessage } from '../../types'
import { isGroup, isPrivate } from '../../types'
import { definePlugin } from '../../utils/define-plugin'
import type { MyWs } from '../../bot/ws'
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

async function scanPics(path: string) {
  pics = await fg(path, { absolute: true })
  scanned = true
}

function errorsToString(errs: any[]) {
  return errs.map(it => ((it as any).reason as string)).join('\n')
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

function replySave(ws: MyWs, message: string, data: any) {
  if (isGroup(data)) {
    ws.send('send_group_msg', {
      group_id: data.group_id,
      message,
    })
  }
  else if (isPrivate(data)) {
    ws.send('send_private_msg', {
      user_id: data.user_id,
      message,
    })
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

async function savePics(message: string, assetPath: string) {
  const matches = message.match(urlPattern)
  if (!matches)
    return Promise.reject(new Error('没有检测到图片'))
  const urls = matches.map((s) => {
    return s.match(singlePicPattern)?.[2]
  }).filter(Boolean) as string[]
  console.warn(urls)

  const tempList: string[] = []
  const existPics = (await Promise.allSettled(urls.map(async (url) => {
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
      throw new Error(`图片 ${filename} 已存在`)
    }

    // fetch the picture data
    const response = await axios({ url, responseType: 'arraybuffer' })
    const absPath = join(removeStar(assetPath), filename)
    // await fsp.writeFile(absPath, response.data)
    await sharpPicture(response.data, absPath)
    tempList.push(filename)
  }))).filter(it => it.status === 'rejected')

  tempList.forEach((filename) => {
    pics.push(join(removeStar(assetPath), filename))
  })

  return [tempList, existPics]
}

const plugin = (
  assetPath: string,
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
    try {
      if (!scanned) {
        await scanPics(assetPath)
        console.warn('共 ', pics.length)
      }

      if (data?.data?.message && cache) {
        const message = data.data.message as string

        const [tempList, existPics] = await savePics(message, assetPath)

        // reply
        if (tempList.length > 0)
          replySave(ws, `已保存 ${tempList.join('\n')}`, cache)

        if (existPics.length > 0)
          throw new Error(errorsToString(existPics))
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
        const [tempList, existPics] = await savePics(message, assetPath)

        // reply
        if (tempList.length > 0)
          replySave(ws, `已保存 ${tempList.join('\n')}`, data)
        if (existPics.length > 0)
          throw new Error(errorsToString(existPics))
        return
      }

      if (replySavePattern.test(message)) {
        // console.warn('根据回复保存图片')
        const msg_id = Number(message.match(replySavePattern)[1])
        if (isNaN(msg_id))
          throw new Error('消息 ID 不合法')

        cache = data

        // console.warn(msg_id)
        ws.send('get_msg', { message_id: msg_id })
      }

      if (message !== '正太' && message !== 'shota')
        return

      if (isGroup(data)) {
        if (notAbleToSend)
          throw new Error('你先别急')

        ws.send('send_group_msg', {
          group_id: data.group_id,
          message: [
            getImage(),
          ],
        })
      }
      else if (isPrivate(data)) {
        if (notAbleToSend)
          throw new Error('你先别急')

        ws.send('send_private_msg', {
          user_id: data.user_id,
          message: [
            getImage(),
          ],
        })
      }

      notAbleToSend = true
      interval = setTimeout(() => {
        clearInterval(interval)
        notAbleToSend = false
      }, 8000)
    }
    catch (e: any) {
      if (cache) {
        if (isGroup(cache)) {
          ws.send('send_group_msg', {
            group_id: cache.group_id,
            message: e.message || String(e),
          })
        }
        else if (isPrivate(cache)) {
          ws.send('send_private_msg', {
            user_id: cache.user_id,
            message: e.message || String(e),
          })
        }
        cache = null
      }
      else {
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
    }
  },
})

export default plugin
