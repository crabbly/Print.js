import { collectStyles, addHeader, addFooter } from './functions'
import Print from './print'

export default {
  print: (params, printFrame) => {
    // Get the DOM printable element
    const printElement = isHtmlElement(params.printable) ? params.printable : document.getElementById(params.printable)

    // Check if the element exists
    if (!printElement) {
      window.console.error('Invalid HTML element id: ' + params.printable)
      return
    }

    // Clone the target element including its children (if available)
    params.printableElement = cloneElement(printElement, params)

    // Add header
    if (params.header) {
      addHeader(params.printableElement, params)
    }

    if (params.header || params.footer) {
      // Table structure required for ensuring adequate space to header / footer (applied to every page)
      var tableElement = document.createElement('table')
      var tHeadElement = document.createElement('thead')
      var headTrElement = document.createElement('tr')
      var headTdElement = document.createElement('td')
      var headDivElement = document.createElement('div')
      headDivElement.style.height = params.headerHeight
      headDivElement.innerHTML = '&nbsp;'

      var tBodyElement = document.createElement('tbody')
      var bodyTrElement = document.createElement('tr')
      var bodyTdElement = document.createElement('td')

      var tFootElement = document.createElement('tfoot')
      var footTrElement = document.createElement('tr')
      var footTdElement = document.createElement('td')
      var footDivElement = document.createElement('div')
      footDivElement.style.height = params.footerHeight
      footDivElement.innerHTML = '&nbsp;'

      headTdElement.appendChild(headDivElement)
      headTrElement.appendChild(headTdElement)
      tHeadElement.appendChild(headTrElement)
      tableElement.appendChild(tHeadElement)

      bodyTdElement.appendChild(params.printableElement)
      bodyTrElement.appendChild(bodyTdElement)
      tBodyElement.appendChild(bodyTrElement)
      tableElement.appendChild(tBodyElement)

      footTdElement.appendChild(footDivElement)
      footTrElement.appendChild(footTdElement)
      tFootElement.appendChild(footTrElement)
      tableElement.appendChild(tFootElement)

      params.printableElement = tableElement
    }

    // Add footer
    if (params.footer) {
      addFooter(params.printableElement, params)
    }

    // Print html element contents
    Print.send(params, printFrame)
  }
}

function cloneElement (element, params) {
  // Clone the main node (if not already inside the recursion process)
  const clone = element.cloneNode()

  // Loop over and process the children elements / nodes (including text nodes)
  const childNodesArray = Array.prototype.slice.call(element.childNodes)
  for (let i = 0; i < childNodesArray.length; i++) {
    // Check if we are skipping the current element
    if (params.ignoreElements.indexOf(childNodesArray[i].id) !== -1) {
      continue
    }

    // Clone the child element
    const clonedChild = cloneElement(childNodesArray[i], params)

    // Attach the cloned child to the cloned parent node
    clone.appendChild(clonedChild)
  }

  // Get all styling for print element (for nodes of type element only)
  if (params.scanStyles && element.nodeType === 1) {
    clone.setAttribute('style', collectStyles(element, params))
  }

  // Check if the element needs any state processing (copy user input data)
  switch (element.tagName) {
    case 'SELECT':
      // Copy the current selection value to its clone
      clone.value = element.value
      break
    case 'CANVAS':
      // Copy the canvas content to its clone
      clone.getContext('2d').drawImage(element, 0, 0)
      break
  }

  return clone
}

function isHtmlElement (printable) {
  // Check if element is instance of HTMLElement or has nodeType === 1 (for elements in iframe)
  return typeof printable === 'object' && printable && (printable instanceof HTMLElement || printable.nodeType === 1)
}
