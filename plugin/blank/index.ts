import { createTextMsg } from '../../types'
import { definePlugin } from '../../utils/define-plugin'
import { wrapSend } from '../../utils/wrap-send'

const pattern = /^草$/

export default definePlugin({
  name: 'blank',
  desc: 'No desc',
  async setup({ data, ws }) {
    // 这里的 `data` 虽然类型声明是包含 `message` 属性的
    // 但是由于 go-cq 转发出来的消息类型真的很多，所以不太好判断，因此需要在这里加一个判断
    // 因为有些插件可能会用到 `获取消息` 这个 API，所以不能贸然全局给屏蔽掉 ¯\_(ツ)_/¯
    if (!data.message)
      return
    const message = data.message

    // 直接返回一条数据，那么这个消息将会被封装后发送出去
    // https://github.com/widcardw/go-cq-node/blob/master/utils/define-plugin.ts#L117-L119
    if (pattern.test(message))
      return createTextMsg('生了出来')

    // 如果没有匹配到任何情况，相当于是返回了 `undefined`，在异步中相当于是 `Promise<void>`
    // 那么什么都不会做

    // 对于一些特殊情况，可以使用 `wrapSend` 的方法来手动发送消息，这时就不需要 `return` 一条风装好的消息了
    // if (confition)
    //   wrapSend(ws, data, createTextMsg('手动发送一条消息'))
  },
})
