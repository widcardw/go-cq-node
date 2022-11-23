// import type { Bhttp, Bws } from '../../types'
import fg from 'fast-glob'
import type { ImageMessage } from '../../types'
import { isGroup, isPrivate } from '../../types'
import { definePlugin } from '../../utils/define-plugin'
let interval: NodeJS.Timer
let notAbleToSend = false

let pics: string[] = []
let scanned = false

async function scanPics() {
  pics = await fg('/Users/leeocoy/Pictures/shota/*', { absolute: true })
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

const plugin = (valid?: {
  validGroups?: number[]
  validGroupUsers?: number[]
  validPrivate?: number[]
}) => definePlugin({
  name: 'shota',
  desc: '发送正太图片',
  ...valid,
  async setup({ data, ws }) {
    if (!data.message)
      return

    const message = data.message.trim()

    if (/^(正太|shota) 刷新$/i.test(message)) {
      await scanPics()
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

    if (message !== '正太' && message !== 'shota')
      return

    if (!scanned)
      await scanPics()

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
