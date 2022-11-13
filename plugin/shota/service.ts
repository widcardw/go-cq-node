import fg from 'fast-glob'

async function getImage() {
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
