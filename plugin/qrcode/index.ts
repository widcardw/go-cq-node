import { createTextMsg } from '../../types'
import { definePlugin } from '../../utils/define-plugin'
import { getImage } from './service'

const pattern = /^(二维码|qr(code)?)\s+/i
let inteval: NodeJS.Timeout
let notAbleToSend = false

export default definePlugin({
  name: 'QrCode',
  desc: '二维码生成器',
  async setup({ data }) {
    if (!data.message)
      return

    let message = data.message.trim()
    if (!pattern.test(message))
      return

    message = message.replace(pattern, '').trim()
    if (!message)
      return

    if (notAbleToSend)
      return createTextMsg('你先别急')

    notAbleToSend = true
    inteval = setTimeout(() => {
      clearTimeout(inteval)
      notAbleToSend = false
    }, 5000)

    return [
      {
        type: 'reply',
        data: { id: data.message_id },
      },
      ...(await getImage(message)),
    ]
  },
})
