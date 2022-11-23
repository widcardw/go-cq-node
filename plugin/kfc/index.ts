import axios from 'axios'
import { owner } from '../../private/owner'
import { isGroup } from '../../types'
import { definePlugin } from '../../utils/define-plugin'

const pattern = /^(!|！)kfc$/i
const pattern2 = /^sudo kfc([\s\S]+)?$/i

export default definePlugin({
  name: '!KFC',
  desc: '肯德基疯狂星期四',
  async setup({ data, ws }) {
    if (isGroup(data)) {
      if (!data.message)
        return

      const message = data.message.trim()

      if (!message)
        return

      if (!pattern2.test(message)) {
        if (!pattern.test(message))
          return

        if (new Date().getDay() !== 4) {
          ws.send('send_group_msg', {
            group_id: data.group_id,
            message: '今天还没到疯狂星期四捏',
          })
          return
        }
      }
      else if (!Object.values(owner).includes(data.user_id)) {
        ws.send('send_group_msg', {
          group_id: data.group_id,
          message: '权限不足',
        })
        return
      }

      ws.send('send_group_msg', {
        group_id: data.group_id,
        message: (await axios.get('https://api.widcard.win/kfc')).data,
      })
    }
  },
})
