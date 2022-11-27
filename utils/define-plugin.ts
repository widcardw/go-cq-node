import type { MyWs } from '../bot/ws'
import type { Bhttp, GroupMessage, GroupNotifyMessage, PrivateMessage } from '../types'
import { isGroup, isPrivate } from '../types'

interface FuncParamsWs {
  data: PrivateMessage | GroupMessage | GroupNotifyMessage | any
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

interface PluginOptions {
  name: string
  desc: string
  validGroups?: number[]
  validGroupUsers?: number[]
  validPrivate?: number[]
  setup: (params: FuncParamsWs) => void | Promise<void>
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

function install(plugins: PluginType[], params: FuncParamsWs): void
// function install(plugins: PluginType[], params: FuncParamsHttp): void

function install(plugins: PluginType[], params: FuncParamsWs) {
  plugins.forEach((plugin) => {
    const { data } = params
    if (isPrivate(data)) {
      if (plugin.validPrivate.length > 0) {
        if (!plugin.validPrivate.includes(data.user_id))
          return
      }
    }
    else if (isGroup(data)) {
      if (plugin.validGroups.length > 0) {
        if (!plugin.validGroups.includes(data.group_id))
          return
      }

      if (plugin.validGroupUsers.length > 0) {
        if (!plugin.validGroupUsers.includes(data.user_id))
          return
      }
    }
    plugin.setup(params)
  })
}

export {
  definePlugin,
  install,
  PluginType,
  FunctionalPlugin,
}
