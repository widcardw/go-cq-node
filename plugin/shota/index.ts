// import type { Bhttp, Bws } from '../../types'
import { definePlugin } from '../../utils/define-plugin'
import { getImage } from './service'

// export default async function ({ data, ws }: { data: any; ws: Bws; http: Bhttp }) {
//   if (!data.message)
//     return

//   const message = data.message.trim()
//   if (message !== '正太')
//     return

//   if (data.message_type === 'group') {
//     ws.send('send_group_msg', {
//       group_id: data.group_id,
//       message: [
//         await getImage(),
//       ],
//     })
//   }
// }

const plugin = (valid?: {
  validGroup?:
  {
    groups: number[]
    users: number[]
  }
  validPrivate?: number[]
}) => definePlugin({
  name: 'shota',
  desc: '发送正太图片',
  validGroup: valid?.validGroup,
  validPrivate: valid?.validPrivate,
  async setup({ data, ws }) {
    if (!data.message)
      return

    const message = data.message.trim()
    if (message !== '正太' && message !== 'shota')
      return

    if (data.message_type === 'group') {
      ws.send('send_group_msg', {
        group_id: data.group_id,
        message: [
          await getImage(),
        ],
      })
    }
    else if (data.message_type === 'private') {
      ws.send('send_private_msg', {
        user_id: data.user_id,
        message: [
          await getImage(),
        ],
      })
    }
  },
})

export default plugin
