import { mathjax } from 'mathjax-full/js/mathjax.js'
import { TeX } from 'mathjax-full/js/input/tex.js'
import { SVG } from 'mathjax-full/js/output/svg.js'
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js'
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js'
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js'
import { AssistiveMmlHandler } from 'mathjax-full/js/a11y/assistive-mml.js'
import juice from 'juice/client'

const documentOptions = {
  InputJax: new TeX({ packages: AllPackages }),
  OutputJax: new SVG({ fontCache: 'none' }),
}
const convertOptions = {
  display: false,
}

function renderMath(content: string): string {
  const adaptor = liteAdaptor()
  const handler = RegisterHTMLHandler(adaptor)
  AssistiveMmlHandler(handler)
  const mathDocument = mathjax.document(content, documentOptions)
  const html = adaptor.outerHTML(
    mathDocument.convert(content, convertOptions),
  )
  const stylesheet = adaptor.outerHTML(documentOptions.OutputJax.styleSheet(mathDocument) as any)
  return juice(html + stylesheet)
}

export {
  renderMath,
}
