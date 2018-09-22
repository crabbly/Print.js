import { collectStyles, loopNodesCollectStyles, addWrapper, addHeader } from './functions'
import Print from './print'

export default {
  print: (params, printFrame) => {

    let printableElement = document.createElement('div')
    printableElement.setAttribute('id', 'printJS-html')
    printableElement.innerHTML = params.printable

    // Process html styles
    if (params.scanStyles === true) {
      // Optional - include margin and padding
      if (params.honorMarginPadding) params.targetStyles.push('margin', 'padding')

      // Optional - include color
      if (params.honorColor) params.targetStyles.push('color')

      // Get main element styling
      printableElement.setAttribute('style', collectStyles(printableElement, params) + 'margin:0 !important;')

      // Get all children elements
      let elements = printableElement.children

      // Get styles for all children elements
      loopNodesCollectStyles(elements, params)
    }

    // Add header
    if (params.header) {
      addHeader(printableElement, params.header, params.headerStyle)
    }

    // Store html data
    params.htmlData = addWrapper(printableElement.innerHTML, params)

    // Print html element contents
    Print.send(params, printFrame)
  }
}
