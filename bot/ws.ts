import WebSocket from 'ws'
import type { GroupFileMessage, GroupMessageParams, PrivateFileMessage, PrivateMessageParams, SendActions } from '../types'

export class MyWs {
  ws: WebSocket

  constructor(url: string) {
    this.ws = new WebSocket(url)
  }

  listen(callback: (o: any) => void) {
    this.ws.on('message', (data: any) => {
      try {
        callback(JSON.parse(data))
      }
      catch (e) {
        console.error(e)
      }
    })
  }

  send(action: 'send_private_msg', params: PrivateMessageParams): void
  send(action: 'send_group_msg', params: GroupMessageParams): void
  send(action: 'upload_private_file', params: PrivateFileMessage): void
  send(action: 'upload_group_file', params: GroupFileMessage): void
  send(action: SendActions, params: PrivateMessageParams | GroupMessageParams | PrivateFileMessage | GroupFileMessage) {
    this.ws.send(JSON.stringify({ action, params }))
  }
}

export default function createWs(url: string) {
  return new MyWs(url)
}
