import { defineConfig } from './utils/define-config'
import Shota from './plugin/shota'
import Tap from './plugin/tap'

defineConfig({
  plugins: [
    Shota({
      validGroupUsers: [],
      validGroups: [498993303],
    }),
    Tap,
  ],
})
