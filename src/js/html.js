import { collectStyles, loopNodesCollectStyles, addWrapper, addHeader } from './functions'

export default function (PrintJS) {
  PrintJS.prototype.html = function () {
        // get HTML printable element
    let printElement = document.getElementById(this.params.printable)

        // check if element exists
    if (!printElement) {
      window.console.error('Invalid HTML element id: ' + this.params.printable)

      return false
    }

        // make a copy of the printElement to prevent DOM changes
    let printableElement = document.createElement('div')
    printableElement.appendChild(printElement.cloneNode(true))

        // add cloned element to DOM, to have DOM element methods available. It will also be easier to colect styles
    printableElement.setAttribute('style', 'display:none;')
    printableElement.setAttribute('id', 'printJS-html')
    printElement.parentNode.appendChild(printableElement)

        // update printableElement variable with newly created DOM element
    printableElement = document.getElementById('printJS-html')

        // get main element styling
    printableElement.setAttribute('style', collectStyles(printableElement, this.params) + 'margin:0 !important;')

        // get all children elements
    let elements = printableElement.children

        // get styles for all children elements
    loopNodesCollectStyles(elements, this.params)

        // add header if any
    if (this.params.header) {
      addHeader(printableElement, this.params.header)
    }

        // remove DOM printableElement
    printableElement.parentNode.removeChild(printableElement)

        // store html data
    this.params.htmlData = addWrapper(printableElement.innerHTML, this.params)

        // print html element contents
    this.print()
  }
}
