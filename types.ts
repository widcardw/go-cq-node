interface Bws {
  listen: (callback: (o: any) => void) => void
  send: (action: string, params: any) => void
}

interface Bhttp {
  send: (action: string, params: any) => Promise<any>
}

interface PrivateMessage {
  time: number
  self_id: number
  post_type: 'message' | 'request' | 'notice' | 'meta_event'
  message_type: 'private'
  sub_type: 'friend' | 'group' | 'group_self' | 'other'
  message_id: number
  user_id: number
  message: string
  raw_message: string
  font: number
  sender: {
    user_id: number
    nickname: string
    sex: string
    age: number
  }
  temp_source: number
}

interface GroupMessage {
  time: number
  self_id: number
  post_type: 'message' | 'request' | 'notice' | 'meta_event'
  message_type: 'group'
  sub_type: 'normal' | 'anonymous' | 'notice'
  message_id: number
  user_id: number
  message: string
  raw_message: string
  font: number
  sender: {
    user_id: number
    nickname: string
    sex: 'male' | 'female' | 'unknown'
    age: number
    card: string
    area: string
    level: string
    role: 'owner' | 'admin' | 'member'
    title: string
  }
  group_id: number
  anonymous: {
    id: number
    name: string
    flag: string
  }
}

function isPrivate(data: any): data is PrivateMessage {
  return data.message_type && data.message_type === 'private'
}

function isGroup(data: any): data is GroupMessage {
  return data.message_type && data.message_type === 'group'
}

export {
  Bws,
  Bhttp,
  PrivateMessage,
  GroupMessage,
  isPrivate,
  isGroup,
}
