import WebSocket from 'ws'
// import { bot } from '../config'
import type { Bws } from '../types'

export default function createWs(url: string) {
  const ws = new WebSocket(url)

  const wws: Bws = {
    send(action: string, params: any) {
      ws.send(JSON.stringify({ action, params }))
    },
    listen(callback: (o: any) => void) {
      ws.on('message', (data: string) => {
        try {
          callback(JSON.parse(data))
        }
        catch (e) {
          console.error(e)
        }
      })
    },
  }
  return wws
}

// export default wws
