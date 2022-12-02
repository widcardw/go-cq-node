import createWs from '../bot/ws'
import type { GroupMessage, PrivateMessage } from '../types'
import { isGroup, isPrivate } from '../types'
import type { PluginType } from './define-plugin'
import { install } from './define-plugin'

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
    ws.listen((data: PrivateMessage | GroupMessage | any) => {
      if (isGroup(data)) {
        // 有效的群聊，为空时均有效
        if (resolvedConfig.validGroups.length > 0) {
          // 仅在列表中的群有效
          if (!resolvedConfig.validGroups.includes(data.group_id))
            return
        }

        // 仅有指定用户有效
        if (resolvedConfig.validGroupUsers.length > 0) {
          if (!resolvedConfig.validGroupUsers.includes(data.user_id))
            return
        }

        const match = data.message.trim().match(/^(正太|shota) help(\s+)?(\d+)?$/i)
        if (match) {
          ws.send('send_group_msg', {
            group_id: data.group_id,
            message: getPluginInfo(resolvedConfig.plugins, Number(match[3])),
          })
        }
      }
      else if (isPrivate(data)) {
        // 私聊，仅固定用户有效
        if (resolvedConfig.validPrivate.length > 0) {
          if (!resolvedConfig.validPrivate.includes(data.user_id))
            return
        }

        const match = data.message.trim().match(/^(正太|shota) help(\s+)?(\d+)?$/i)
        if (match) {
          ws.send('send_private_msg', {
            user_id: data.user_id,
            message: getPluginInfo(resolvedConfig.plugins, Number(match[3])),
          })
        }
      }

      if (process.env.NODE_ENV === 'development') {
        if (data.post_type !== 'meta_event' && data.meta_event_type !== 'heartbeat')
        // eslint-disable-next-line no-console
          console.log('这是 main 中打印的', data)
      }

      install(resolvedConfig.plugins, { data, ws })
    })
  }
}

export {
  CqtsConfig,
  defineConfig,
}
