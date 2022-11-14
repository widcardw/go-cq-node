import { isGroup, isPrivate } from '../../types'
import { definePlugin } from '../../utils/define-plugin'
import { getImage } from './service'

const pattern = /^(二维码|qr(code)?)\s+/i

export default definePlugin({
  name: 'Qr Code',
  desc: '二维码生成器',
  async setup({ data, ws }) {
    if (!data.message)
      return

    let message = data.message.trim()

    if (!pattern.test(message))
      return

    message = message.replace(pattern, '').trim()
    if (!message)
      return

    if (isGroup(data)) {
      ws.send('send_group_msg', {
        group_id: data.group_id,
        message: [
          {
            type: 'reply',
            data: { id: data.message_id },
          },
          ...(await getImage(message)),
        ],
      })
    }
    else if (isPrivate(data)) {
      ws.send('send_private_msg', {
        user_id: data.user_id,
        message: await getImage(message),
      })
    }
  },
})
