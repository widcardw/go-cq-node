import { defineConfig } from './utils/define-config'
import Shota from './plugin/shota'
import Tap from './plugin/blank'

defineConfig({
  plugins: [
    Shota(),
    Tap,
  ],
})
