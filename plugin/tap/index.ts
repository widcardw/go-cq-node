import { isGroup, isGroupNotify } from '../../types'
import { definePlugin } from '../../utils/define-plugin'

const pattern = /^[摸拍挠戳]正太(头|脑袋)?$/
const pattern2 = /^[揉拍挠摸戳舔]正太[蛋淡〇即鸡唧]{2,}$/

const m = [
  '会长不高的呜呜',
  '不要',
  '达咩',
  '唔唔',
]

const m2 = [
  '变态！',
  '变态！',
  '変态！！',
  '再摸我要报警了！',
  '达咩！',
  '达咩！',
  '好舒服～',
  '嘘～别被别人知道了……',
  '不可以这样！',
  '轻点～',
  '轻点～',
]

const chuo = [
  '别戳了！',
  '好痒啊',
]

export default definePlugin({
  name: 'Tap',
  desc: '输入 [摸拍挠戳]正太(头|脑袋) 自动回应',
  async setup({ data, ws }) {
    if (isGroup(data)) {
      if (!data.message)
        return

      const message = data.message.trim()

      if (!message)
        return

      if (pattern.test(message)) {
        const rand = Math.floor(Math.random() * m.length)
        ws.send('send_group_msg', {
          group_id: data.group_id,
          message: m[rand],
        })
      }
      else if (pattern2.test(message)) {
        const rand = Math.floor(Math.random() * m2.length)
        ws.send('send_group_msg', {
          group_id: data.group_id,
          message: m2[rand],
        })
      }
    }
    else if (isGroupNotify(data)) {
      const rand = Math.floor(Math.random() * chuo.length)
      ws.send('send_group_msg', {
        group_id: data.group_id,
        message: chuo[rand],
      })
    }
  },
})
