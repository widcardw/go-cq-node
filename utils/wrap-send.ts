import type { MyWs } from '../bot/ws'
import type { SentMessage } from '../types'
import { isGroup, isPrivate } from '../types'
import type { ReceivedMessageType } from './define-plugin'

function wrapSend(
  ws: MyWs,
  data: ReceivedMessageType,
  message: SentMessage,
) {
  if (isGroup(data)) {
    ws.send('send_group_msg', {
      group_id: data.group_id,
      message,
    })
  }

  else if (isPrivate(data)) {
    ws.send('send_private_msg', {
      user_id: data.user_id,
      message,
    })
  }
}

export {
  wrapSend,
}
