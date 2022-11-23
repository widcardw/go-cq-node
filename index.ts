import { defineConfig } from './utils/define-config'
import Shota from './plugin/shota'
import Tap from './plugin/tap'
import QrCode from './plugin/qrcode'
import Kfc from './plugin/kfc'
import { groups } from './private/groups'
import Xibao from './plugin/xibao'

defineConfig({
  plugins: [
    Shota('/Users/leeocoy/Pictures/shota/*', {
      validGroupUsers: [],
      validGroups: Object.values(groups),
    }),
    Tap,
    QrCode,
    Kfc,
    Xibao(Object.values(groups)),
  ],
  validGroups: Object.values(groups),
})
