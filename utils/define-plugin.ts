import type { MyWs } from '../bot/ws'
import type { Bhttp, GroupMessage, PrivateMessage, SentMessage } from '../types'
import { isGroup, isPrivate } from '../types'
import { wrapSend } from './wrap-send'
type ReceivedMessageType = PrivateMessage | GroupMessage

interface FuncParamsWs {
  data: ReceivedMessageType
  ws: MyWs
  http?: Bhttp
  // type: '__FuncParamsWs'
}

// interface FuncParamsHttp {
//   data: PrivateMessage | GroupMessage | any
//   http: Bhttp
//   ws?: MyWs
//   type: '__FuncParamsHttp'
// }

// function isFuncParamsWs(data: any): data is FuncParamsWs {
//   return data.type && data.type === '__FuncParamsWs'
// }

// function isFuncParamsHttp(data: any): data is FuncParamsHttp {
//   return data.type && data.type === '__FuncParamsHttp'
// }

interface ValidateConfig {
  validGroups?: number[]
  validGroupUsers?: number[]
  validPrivate?: number[]
}

type RestrictedValidateConfig = Required<ValidateConfig>

interface PluginOptions extends ValidateConfig {
  name: string
  desc: string
  setup: (params: FuncParamsWs) => SentMessage | Promise<SentMessage | undefined> | undefined
}

type RestrictedPluginOptions = Required<PluginOptions>

interface PluginType extends RestrictedPluginOptions {

}

type FunctionalPlugin = () => PluginOptions

function definePlugin(options: PluginOptions): PluginType
function definePlugin(options: FunctionalPlugin): PluginType

function definePlugin(options: PluginOptions | FunctionalPlugin): PluginType {
  if (typeof options === 'function') {
    const o = resolveOptions(options())
    return {
      ...o,
      get name() {
        return o.name
      },
      get desc() {
        return o.desc
      },
    }
  }
  else {
    return {
      ...resolveOptions(options),
      get name() {
        return options.name
      },
      get desc() {
        return options.desc
      },
    }
  }
}

function resolveOptions(options: PluginOptions): RestrictedPluginOptions {
  const o: RestrictedPluginOptions = {
    validGroups: [],
    validGroupUsers: [],
    validPrivate: [],
    ...options,
  }
  return o
}

function validateAbleToResponse(plugin: RestrictedValidateConfig, data: ReceivedMessageType): boolean {
  if (isPrivate(data)) {
    if (plugin.validPrivate.length > 0) {
      if (!plugin.validPrivate.includes(data.user_id))
        return false
    }
  }
  else if (isGroup(data)) {
    if (plugin.validGroups.length > 0) {
      if (!plugin.validGroups.includes(data.group_id))
        return false
    }

    if (plugin.validGroupUsers.length > 0) {
      if (!plugin.validGroupUsers.includes(data.user_id))
        return false
    }
  }
  return true
}

function install(plugins: PluginType[], params: FuncParamsWs) {
  plugins.forEach(async (plugin) => {
    const { data, ws } = params
    const valid = validateAbleToResponse(plugin, data)
    if (!valid)
      return
    const sentMsg = await plugin.setup(params)
    if (sentMsg)
      wrapSend(ws, data, sentMsg)
  })
}

export {
  definePlugin,
  install,
  PluginType,
  FunctionalPlugin,
  ReceivedMessageType,
  ValidateConfig,
  RestrictedValidateConfig,
  validateAbleToResponse,
}
