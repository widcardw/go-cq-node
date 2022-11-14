interface Bws {
  listen: (callback: (o: any) => void) => void
  send: (action: string, params: GroupMessageParams | PrivateMessageParams) => void
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

interface GroupNotifyMessage {
  post_type: 'notice'
  notice_type: 'notify'
  time: number
  self_id: number
  sub_type: string
  group_id: number
  user_id: number
  target_id: number // 被戳者
}

type TextMessage = string | {
  type: 'text'
  data: {
    text: string
  }
}

interface ReplyMessage {
  type: 'reply'
  data: {
    id: number
  }
}

interface ImageMessage {
  type: 'image'
  data: {
    file: string
  }
}

type MulMessage = TextMessage | ReplyMessage | ImageMessage

interface GroupMessageParams {
  group_id: number
  message: MulMessage | MulMessage[]
}

interface PrivateMessageParams {
  user_id: number
  message: MulMessage | MulMessage[]
}

function isPrivate(data: any): data is PrivateMessage {
  return data.message_type && data.message_type === 'private'
}

function isGroup(data: any): data is GroupMessage {
  return data.message_type && data.message_type === 'group'
}

function isGroupNotify(data: any): data is GroupNotifyMessage {
  return data.post_type && data.post_type === 'notice'
  && data.notice_type && data.notice_type === 'notify'
}

export {
  Bws,
  Bhttp,
  PrivateMessage,
  GroupMessage,
  TextMessage,
  ReplyMessage,
  ImageMessage,
  MulMessage,
  GroupNotifyMessage,
  GroupMessageParams,
  PrivateMessageParams,
  isPrivate,
  isGroup,
  isGroupNotify,
}
