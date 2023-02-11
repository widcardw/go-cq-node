import axios from 'axios'
import { owner } from '../../private/owner'
import { createTextMsg } from '../../types'
import { definePlugin } from '../../utils/define-plugin'
import { randInt } from '../../utils/rand'

const pattern = /^(!|！)kfc$/i
const pattern2 = /^sudo kfc([\s\S]+)?$/i

const ben = [
  '笨！',
  '为什么用全角！',
]

export default definePlugin({
  name: '!KFC',
  desc: '肯德基疯狂星期四',
  async setup({ data }) {
    if (!data.message)
      return

    const message = data.message.trim()

    if (!message)
      return

    if (!pattern2.test(message)) {
      if (!pattern.test(message))
        return

      if (message.startsWith('！'))
        return createTextMsg(ben[randInt(0, ben.length)])

      if (new Date().getDay() !== 4)
        return createTextMsg('今天还没到疯狂星期四捏')
    }
    else if (!Object.values(owner).includes(data.user_id)) {
      return createTextMsg('权限不足')
    }

    try {
      return createTextMsg(
        (await axios.get('https://api.widcard.win/kfc', { timeout: 5000 })).data,
      )
    }
    catch (e) {
      return createTextMsg(String(e))
    }
  },
})
