import { isGroup } from '../../types'
import { definePlugin } from '../../utils/define-plugin'

const pattern = /^草$/

export default definePlugin({
  name: 'blank',
  desc: 'No desc',
  async setup({ data, ws }) {
    if (isGroup(data)) {
      if (!data.message)
        return

      const message = data.message.trim()

      if (!message)
        return

      if (pattern.test(message)) {
        ws.send('send_group_msg', {
          group_id: data.group_id,
          message: '生了出来',
        })
      }
    }
  },
})
