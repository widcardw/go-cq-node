import fsp from 'fs/promises'
import { join } from 'path'
import axios from 'axios'
import fg from 'fast-glob'
import { nanoid } from 'nanoid'
import type { ImageMessage } from '../../types'
import { isGroup, isPrivate } from '../../types'
import { definePlugin } from '../../utils/define-plugin'
let interval: NodeJS.Timer
let notAbleToSend = false

let pics: string[] = []
let scanned = false

function removeStar(path: string) {
  return path.replace('*', '')
}

const urlPattern = /\[CQ:image,file=([^\]]+?),url=([^\]]+?)\]/g

async function scanPics(path: string) {
  pics = await fg(path, { absolute: true })
  scanned = true
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
    if (!data.message)
      return

    const message = data.message.trim()

    if (/^(正太|shota) (刷新|refresh)$/i.test(message)) {
      await scanPics(assetPath)
      const m = `已刷新，共 ${pics.length} 张图片`
      if (isGroup(data)) {
        const { group_id } = data
        ws.send('send_group_msg', {
          group_id, message: m,
        })
      }
      else if (isPrivate(data)) {
        const { user_id } = data
        ws.send('send_private_msg', {
          user_id, message: m,
        })
      }
      return
    }

    if (/^(正太|shota) (保存|save)([\s\S]+)?$/i.test(message)) {
      const matches = message.match(urlPattern) as string[]
      if (!matches) {
        if (isGroup(data)) {
          ws.send('send_group_msg', {
            group_id: data.group_id,
            message: '暂不支持“图呢”',
          })
        }
        else if (isPrivate(data)) {
          ws.send('send_private_msg', {
            user_id: data.user_id,
            message: '暂不支持“图呢”',
          })
        }
        return
      }
      const urls = matches.map((s) => {
        return s.match(/\[CQ:image,file=([^\]]+?),url=([^\]]+?)\]$/)?.[2]
      }).filter(Boolean) as string[]

      const tempList: string[] = []
      await Promise.all(urls.map(async (url) => {
        const response = await axios({ url, responseType: 'stream' })
        const filename = `shota-${nanoid(13)}.jpg`
        const absPath = join(removeStar(assetPath), filename)
        await fsp.writeFile(absPath, response.data)
        tempList.push(filename)
      }))
      pics.push(...tempList)
      // const response = await axios({ url, responseType: 'stream' })
      // const filename = `go-cq-shota-${Date.now()}.jpg`
      // const absPath = join(removeStar(assetPath), filename)
      // await fsp.writeFile(absPath, response.data)
      // pics.push(absPath)
      if (isGroup(data)) {
        ws.send('send_group_msg', {
          group_id: data.group_id,
          message: `已保存 ${tempList.join('\n')}`,
        })
      }
      else if (isPrivate(data)) {
        ws.send('send_private_msg', {
          user_id: data.user_id,
          message: `已保存 ${tempList.join('\n')}`,
        })
      }
      return
    }

    if (message !== '正太' && message !== 'shota')
      return

    if (!scanned)
      await scanPics(assetPath)

    if (isGroup(data)) {
      if (notAbleToSend) {
        ws.send('send_group_msg', {
          group_id: data.group_id,
          message: '你先别急',
        })
        return
      }
      ws.send('send_group_msg', {
        group_id: data.group_id,
        message: [
          getImage(),
        ],
      })
    }
    else if (isPrivate(data)) {
      if (notAbleToSend) {
        ws.send('send_private_msg', {
          user_id: data.user_id,
          message: '你先别急',
        })
        return
      }
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
  },
})

export default plugin
