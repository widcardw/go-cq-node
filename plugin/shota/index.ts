// import type { Bhttp, Bws } from '../../types'
import { isGroup, isPrivate } from '../../types'
import { definePlugin } from '../../utils/define-plugin'
import { getImage } from './service'

let interval: NodeJS.Timer
let notAbleToSend = false

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
    if (message !== '正太' && message !== 'shota')
      return

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
          await getImage(),
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
          await getImage(),
        ],
      })
    }

    notAbleToSend = true
    interval = setTimeout(() => {
      clearInterval(interval)
      notAbleToSend = false
    }, 5000)
  },
})

export default plugin
