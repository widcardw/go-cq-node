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
  const pluginInfo = resolvedConfig.plugins.map((p, index) => {
    return `${index + 1}. ${p.name}: ${p.desc}`
  })
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

        if (data.message === '正太 help') {
          ws.send('send_group_msg', {
            group_id: data.group_id,
            message: pluginInfo.join('\n'),
          })
        }
      }
      else if (isPrivate(data)) {
        // 私聊，仅固定用户有效
        if (resolvedConfig.validPrivate.length > 0) {
          if (!resolvedConfig.validPrivate.includes(data.user_id))
            return
        }

        if (data.message === '正太 help') {
          ws.send('send_private_msg', {
            user_id: data.user_id,
            message: pluginInfo.join('\n'),
          })
        }
      }

      if (process.env.NODE_ENV === 'development') {
        if (data.post_type !== 'meta_event' && data.meta_event_type !== 'heartbeat')
        // eslint-disable-next-line no-console
          console.log(data)
      }

      install(resolvedConfig.plugins, { data, ws })
    })
  }
}

export {
  CqtsConfig,
  defineConfig,
}
