import fg from 'fast-glob'
import type { ImageMessage } from '../../types'

async function getImage(): Promise<ImageMessage> {
  const pics = await fg('/Users/leeocoy/Pictures/shota/*', { absolute: true })
  const len = pics.length
  const rand = Math.floor(len * Math.random())
  return {
    type: 'image',
    data: {
      file: `file://${pics[rand]}`,
    },
  }
}

export {
  getImage,
}
