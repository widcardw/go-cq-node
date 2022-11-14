# go-cqhttp/node

> 基于 go-cqhttp 和 nodejs 的 qq 机器人

## 安装

- 克隆本仓库
- 在 https://github.com/Mrs4s/go-cqhttp/releases 下载对应平台的可执行文件, 放到 `go-cqhttp` 目录中
- 安装 nodejs 环境 (建议 12.0 以上版本), 根目录运行 `pnpm install` 安装依赖

## 启动

- 运行 `go-cqhttp/下载的文件`, 根据提示填写 QQ 号和密码等信息, 参考文档 https://docs.go-cqhttp.org/guide/quick_start.html
  - 本地实测的时候，发现第一次登录必须使用手机扫码，否则一直提示密码错误
  - 一般来说，运行命令是 `cd go-cqhttp && ./go-cqhttp -faststart`
- 根目录运行 `pnpm run dev`
  - 在此之前，需要先检查一下，插件中所写入的目录，本地是否存在，例如 `shota` 插件就包含了本地的路径；以及 `index.ts` 中是否存在未引入的信息和数据结构等，例如该机器人就只在仅有的两个群运行，而信息文件并未上传。

## 插件

### 配置插件

在 `index.ts` 中配置的插件才会被加载, 并且需要在插件目录运行 `pnpm install` 安装依赖

```ts
// index.ts

import { defineConfig } from './utils/define-config'
import Tap from './plugin/blank'

defineConfig({
  processor: 'ws', // http 暂时还没写
  url: 'ws://0.0.0.0:6700',
  plugins: [
    Tap,
  ],
  validGroups: [12345678, 90123456], // 为空时均接收，不为空时仅接受列表内的群号
  validGroupUsers: [], // 为空时均接收，不为空时仅接受列表内用户发送的群消息
  validPrivate: [], // 为空时均接收，不为空时仅接受列表内用户的私信
})
```

### 内置插件

| 插件                      | 说明       |
| ------------------------- | ---------- |
| [blank](plugin/blank)     | 空白插件   |
| [qrcode](plugin/qrcode)   | 二维码     |
| [shota](plugin/shota)     | 正太图（续自行放图片）   |
| [kfc](plugin/kfc)     | 肯德基疯狂星期四文案   |
| [tap](plugin/tap)     |  自动回复文案  |

### 开发插件

复制 [plugin/blank](plugin/blank), 参考其它插件和 https://docs.go-cqhttp.org 进行开发

```ts
// plugin/blank
import { definePlugin } from '../../utils/define-plugin'

export default definePlugin({
  name: 'blank',
  desc: 'No desc',
  async setup({ data, ws }) {
    // TODO
  },
  validGroups: [12345678, 90123456], // 为空时均接收，不为空时仅接受列表内的群号
  validGroupUsers: [], // 为空时均接收，不为空时仅接受列表内用户发送的群消息
  validPrivate: [], // 为空时均接收，不为空时仅接受列表内用户的私信
})
```

## 部署 ( 暂未测试 ) (Linux)

- 安装 screen 工具后: 后台运行 `go-cqhttp/下载的文件` (screen 命令用法自行搜索)

- 安装 pm2 工具后: 在根目录运行 `npm start`

- 代码更新: 在根目录运行 `npm run reload`

> 因为 go-cqhttp 登录需要交互操作, 而 pm2 不支持, 所以这里用 screen 运行 go-cqhttp, 你也可以用其它方法后台运行

## 其它

- [go-cqhttp/java](https://github.com/go-cqhttp/java) - qq 机器人 java 版
