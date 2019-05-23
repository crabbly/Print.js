import { collectStyles, loopNodesCollectStyles, addWrapper, addHeader } from './functions'
import Print from './print'

export default {
  print: (params, printFrame) => {
    // Get the DOM printable element
    let printElement = document.getElementById(params.printable)

    // Check if the element exists
    if (!printElement) {
      window.console.error('Invalid HTML element id: ' + params.printable)
      return
    }

    // Clone the target element including its children (if any) into a div container / wrapper
    let printableElement = document.createElement('div')
    printableElement.appendChild(cloneElement(printElement, params))

    // Add cloned element to DOM, to have DOM element methods available. It will also be easier to colect styles
    printableElement.setAttribute('style', 'height:0; overflow:hidden;')
    printableElement.setAttribute('id', 'printJS-html')
    printElement.parentNode.appendChild(printableElement)

    // Update printableElement variable with newly created DOM element
    printableElement = document.getElementById('printJS-html')

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

    // Remove DOM printableElement
    printableElement.parentNode.removeChild(printableElement)

    // Store html data
    params.htmlData = addWrapper(printableElement.innerHTML, params)

    // Print html element contents
    Print.send(params, printFrame)
  }
}

function cloneElement (element, params) {
  // Clone the main node (if not already inside the recursion process)
  const clone = element.cloneNode()

  // Loop over and process the children elements / nodes (including text nodes)
  for (let child of element.childNodes) {
    // Check if we are skiping the current element
    if (params.ignoreElements.indexOf(child.id) !== -1) {
      continue
    }

    // Clone the child element
    const clonedChild = cloneElement(child, params)

    // Attach the cloned child to the cloned parent node
    clone.appendChild(clonedChild)
  }

  // Check if the element needs any state processing (copy user input data)
  switch (element.tagName) {
    case 'INPUT':
      switch (element.type) {
        case 'checkbox':
          // TODO
          break
      }
      break
    case 'TEXTAREA':
      // TODO
      break
    case 'SELECT':
      // TODO
      break
    case 'CANVAS':
      // TODO
      break
  }

  return clone
}
