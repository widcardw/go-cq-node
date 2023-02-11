import type { MyWs } from '../bot/ws'
import createWs from '../bot/ws'
import { createTextMsg } from '../types'
import type { PluginType, ReceivedMessageType, RestrictedValidateConfig } from './define-plugin'
import { install, validateAbleToResponse } from './define-plugin'
import { wrapSend } from './wrap-send'

interface CqtsConfig {
  /**
   * @default 'ws'
   */
  processor?: 'ws' | 'http'
  plugins?: PluginType[]
  validGroups?: number[]
  validGroupUsers?: number[]
  validPrivate?: number[]
  url?: string
}

type RestrictedCqtsConfig = Required<CqtsConfig>

const pageSize = 10

function getPluginInfo(plugins: PluginType[], page: number): string {
  if (plugins.length === 0)
    return '暂时没有安装插件捏'

  if (Number.isNaN(page) || page === 0) {
    let info = plugins.slice(0, pageSize).map((p, index) => {
      return `${index + 1}. ${p.name}: ${p.desc}`
    }).join('\n')
    if (plugins.length > pageSize)
      info += '\n更多内容请添加页码参数'
    return info
  }
  if ((page - 1) * pageSize > plugins.length)
    return '没有更多了'
  return plugins.slice((page - 1) * pageSize, pageSize * page).map((p, index) => {
    return `${index + 1 + (page - 1) * pageSize}. ${p.name}: ${p.desc}`
  }).join('\n')
}

function infoPlugin(plugins: PluginType[], ws: MyWs, data: ReceivedMessageType): boolean {
  const match = data.message && data.message.trim().match(/^(正太|shota) help(\s+)?(\d+)?$/i)
  if (!match)
    return false
  const context = getPluginInfo(plugins, Number(match[3]))
  wrapSend(ws, data, createTextMsg(context))
  return true
}

function defineConfig(config: CqtsConfig) {
  const resolvedConfig: RestrictedCqtsConfig = {
    processor: 'ws',
    plugins: [],
    validGroups: [],
    validGroupUsers: [],
    validPrivate: [],
    url: 'ws://0.0.0.0:6700',
    ...config,
  }
  if (resolvedConfig.processor === 'ws') {
    const ws = createWs(resolvedConfig.url)
    const { plugins, validGroups, validGroupUsers, validPrivate } = resolvedConfig
    ws.listen((data: ReceivedMessageType) => {
      if (data.post_type === 'meta_event' || data.post_type === 'notice' || data.post_type === 'request')
        return
      // eslint-disable-next-line no-console
      console.log(data)
      if ((data as any).data && Object.keys((data as any).data).length === 1)
        return

      const valid = validateAbleToResponse({
        validGroups,
        validGroupUsers,
        validPrivate,
      }, data)
      if (!valid)
        return

      if (data.message && data.message.trim() === '')
        return

      if (infoPlugin(resolvedConfig.plugins, ws, data))
        return

      try {
        install(plugins, { data, ws })
      }
      catch (e) {
        wrapSend(ws, data, createTextMsg(String(e)))
      }
    })
  }
}

export {
  CqtsConfig,
  defineConfig,
}
