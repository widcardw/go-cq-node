import { createTextMsg } from '../../types'
import { definePlugin } from '../../utils/define-plugin'

const pattern = /^草$/

export default definePlugin({
  name: 'blank',
  desc: 'No desc',
  async setup({ data }) {
    if (!data.message)
      return
    const message = data.message

    if (pattern.test(message))
      return createTextMsg('生了出来')
  },
})
