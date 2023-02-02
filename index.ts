import { defineConfig } from './utils/define-config'
import Shota from './plugin/shota'
import Tap from './plugin/tap'
import QrCode from './plugin/qrcode'
import Kfc from './plugin/kfc'
import { groups } from './private/groups'
import Xibao from './plugin/xibao'
import Tex from './plugin/tex'

defineConfig({
  plugins: [
    Shota([
      '/Users/leeocoy/Pictures/shota/*',
      // '/Users/leeocoy/Pictures/xiaokeci/**',
    ], {
      validGroupUsers: [],
      validGroups: Object.values(groups),
    }),
    Tap,
    QrCode,
    Kfc,
    Xibao(Object.values(groups)),
    Tex({ validGroups: Object.values(groups) }),
  ],
  validGroups: Object.values(groups),
})
