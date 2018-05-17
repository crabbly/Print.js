import { collectStyles, loopNodesCollectStyles, addWrapper, addHeader } from './functions'
import Print from './print'

export default {
  print: (params, printFrame) => {
    // Get HTML printable element
    let printElement = document.getElementById(params.printable)

    // Check if element exists
    if (!printElement) {
      window.console.error('Invalid HTML element id: ' + params.printable)

      return false
    }

    // Make a copy of the printElement to prevent DOM changes
    let printableElement = document.createElement('div')
    printableElement.appendChild(printElement.cloneNode(true))

    // Add cloned element to DOM, to have DOM element methods available. It will also be easier to colect styles
    printableElement.setAttribute('style', 'height:0; overflow:hidden;')
    printableElement.setAttribute('id', 'printJS-html')
    printElement.parentNode.appendChild(printableElement)

    // Update printableElement variable with newly created DOM element
    printableElement = document.getElementById('printJS-html')

    // Get main element styling
    if (params.scanStyles === true) {
      printableElement.setAttribute('style', collectStyles(printableElement, params) + 'margin:0 !important;')
    }

    // Get all children elements
    let elements = printableElement.children

    // Get styles for all children elements
    if (params.scanStyles === true) {
      loopNodesCollectStyles(elements, params)
    }

    // Add header if any
    if (params.header) {
      addHeader(printableElement, params.header, params.headerStyle)
    }

    // Remove DOM printableElement
    printableElement.parentNode.removeChild(printableElement)

    // Store html data
    params.htmlData = addWrapper(printableElement.innerHTML, params)

    // Print html element contents
    Print.send(params, printFrame)
  }
}
