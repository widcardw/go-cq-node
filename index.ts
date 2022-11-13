import { defineConfig } from './utils/define-config'
import Shota from './plugin/shota'
import Tap from './plugin/tap'
import { groups } from './private/groups'

defineConfig({
  plugins: [
    Shota({
      validGroupUsers: [],
      validGroups: Object.values(groups),
    }),
    Tap,
  ],
})
