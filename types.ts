type SendActions = 'send_private_msg' | 'send_group_msg' | 'upload_private_file' | 'upload_group_file' | 'get_msg'

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

interface ToBeSentMessage {
  type: string
}

interface TextMessage extends ToBeSentMessage {
  type: 'text'
  data: {
    text: string
  }
}

interface ReplyMessage extends ToBeSentMessage {
  type: 'reply'
  data: {
    id: number
  }
}

interface ImageMessage extends ToBeSentMessage {
  type: 'image'
  data: {
    file: string
  }
}

function createTextMsg(text: string): TextMessage {
  return {
    type: 'text',
    data: { text },
  }
}

function createReplyMsg(id: number): ReplyMessage {
  return {
    type: 'reply',
    data: { id },
  }
}

function createImgMsg(url: string): ImageMessage {
  return {
    type: 'image',
    data: { file: url },
  }
}

type MulMessage = TextMessage | ReplyMessage | ImageMessage

type SentMessage = MulMessage | MulMessage[]

interface GroupMessageParams {
  group_id: number
  message: SentMessage
}

interface PrivateMessageParams {
  user_id: number
  message: SentMessage
}

interface PrivateFileMessage {
  user_id: number
  file: string
  name: string
}

interface GroupFileMessage {
  group_id: number
  file: string
  name: string
}

interface GetMessageParams {
  message_id: number
}

function isGetMessageParams(data: any): data is GetMessageParams {
  const keys = Object.keys(data)
  return keys.length === 1 && keys[0] === 'message_id'
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
  GetMessageParams,
  GroupFileMessage,
  PrivateFileMessage,
  SendActions,
  isPrivate,
  isGroup,
  isGroupNotify,
  isGetMessageParams,
  createTextMsg,
  createReplyMsg,
  createImgMsg,
  SentMessage,
}
