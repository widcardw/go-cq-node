import { AsciiMath } from 'asciimath-parser'
import { createImgMsg, createTextMsg } from '../../types'
import { definePlugin } from '../../utils/define-plugin'
import { transformSymbols } from '../xibao'
import { toPng } from './toPng'
import { renderMath } from './toSvg'
const AM = /^!am([\s\S]+)$/i
const TEX = /^!tex([\s\S]+)$/i
const ERROR = /data-mjx-error="([^"]*)"/

const am = new AsciiMath()

function isExpression(code: string) {
  if (code.length === 0)
    return false
  if (/http/i.test(code))
    return false
  if (/\[CQ:/i.test(code))
    return false
  return true
}

export default (valid?: {
  validGroups?: number[]
  validGroupUsers?: number[]
  validPrivate?: number[]
}) => definePlugin({
  name: '公式生成器',
  desc: '!am 或 !tex 生成公式',
  ...valid,
  async setup({ data }) {
    if (!data.message)
      return

    let message = data.message.trim()

    if (!message)
      return

    let tex = ''

    message = transformSymbols(message)

    if (AM.test(message)) {
      const match = message.match(AM)
      if (!match)
        return

      const exp = match[1].trim()
      if (!isExpression(exp))
        return

      tex = am.toTex(exp)
    }
    else if (TEX.test(message)) {
      const match = message.match(TEX)
      if (!match)
        return

      const exp = match[1].trim()
      if (!isExpression(exp))
        return

      tex = exp
    }
    else {
      return
    }
    let svg = ''
    let error = ''
    if (/\\text\{Error:[^\}]*/.test(tex)) {
      error = tex.match(/\\text\{(Error:[^\}]*)/)![1]
    }
    else {
      svg = renderMath(tex)
      const errorMatch = svg.match(ERROR)
      error = (errorMatch && errorMatch[1]) || ''
    }

    if (error)
      return createTextMsg(error)

    return createImgMsg(`file://${(await toPng(svg))}`)
  },
})
