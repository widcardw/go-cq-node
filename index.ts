import { defineConfig } from './utils/define-config'
import Shota from './plugin/shota'
import Tap from './plugin/tap'
import QrCode from './plugin/qrcode'
import Kfc from './plugin/kfc'
import { groups } from './private/groups'

defineConfig({
  plugins: [
    Shota({
      validGroupUsers: [],
      validGroups: Object.values(groups),
    }),
    Tap,
    QrCode,
    Kfc,
  ],
  validGroups: Object.values(groups),
})
