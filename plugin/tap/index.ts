import { createTextMsg } from '../../types'
import { definePlugin } from '../../utils/define-plugin'
import { randInt } from '../../utils/rand'

const pattern = /^[摸拍挠戳]正太(头|脑袋)?$/
const pattern2 = /^[揉拍挠摸戳舔捏]正太[蛋淡〇即鸡唧]{2,}$/

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
  '嗯！哼！哼！啊啊啊啊啊啊啊！！！',
  '戳喵呜',
  '怎么了嘛',
]

export default definePlugin({
  name: 'Tap',
  desc: '[摸拍挠戳]正太(头|脑袋)',
  async setup({ data }) {
    if (!data.message)
      return
    const message = data.message
    if (pattern.test(message)) {
      const rand = randInt(0, m.length)
      return createTextMsg(m[rand])
    }
    else if (pattern2.test(message)) {
      const rand = Math.floor(Math.random() * m2.length)
      return createTextMsg(m2[rand])
    }
  },
})
