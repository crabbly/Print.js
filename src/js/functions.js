export function addWrapper (htmlData, params) {
  let bodyStyle = 'font-family:' + params.font + ' !important; font-size: ' + params.font_size + ' !important; width:100%;'
  return '<div style="' + bodyStyle + '">' + htmlData + '</div>'
}

export function capitalizePrint (obj) {
  return obj.charAt(0).toUpperCase() + obj.slice(1)
}

export function collectStyles (element, params) {
  let win = document.defaultView || window

  // String variable to hold styling for each element
  let elementStyle = ''

  // Loop over computed styles
  let styles = win.getComputedStyle(element, '')

  Object.keys(styles).map(key => {
    // Check if style should be processed
    if (params.targetStyles.indexOf('*') !== -1 || params.targetStyle.indexOf(styles[key]) !== -1 || targetStylesMatch(params.targetStyles, styles[key])) {
      if (styles.getPropertyValue(styles[key])) elementStyle += styles[key] + ':' + styles.getPropertyValue(styles[key]) + ';'
    }
  })

  // Print friendly defaults
  elementStyle += 'max-width: ' + params.maxWidth + 'px !important;' + params.font_size + ' !important;'

  return elementStyle
}

function targetStylesMatch (styles, value) {
  for (let i = 0; i < styles.length; i++) {
    if (typeof value === 'object' && value.indexOf(styles[i]) !== -1) return true
  }
  return false
}

export function loopNodesCollectStyles (elements, params) {
  for (let n = 0; n < elements.length; n++) {
    let currentElement = elements[n]

    // Check if we are skiping this element
    if (params.ignoreElements.indexOf(currentElement.getAttribute('id')) !== -1) {
      currentElement.parentNode.removeChild(currentElement)
      continue
    }

    // Form Printing - check if is element Input
    let tag = currentElement.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      // Save style to variable
      let textStyle = collectStyles(currentElement, params)

      // Remove INPUT element and insert a text node
      let parent = currentElement.parentNode

      // Get text value
      let textNode = tag === 'SELECT'
        ? document.createTextNode(currentElement.options[currentElement.selectedIndex].text)
        : document.createTextNode(currentElement.value)

      // Create text element
      let textElement = document.createElement('div')
      textElement.appendChild(textNode)

      // Add style to text
      textElement.setAttribute('style', textStyle)

      // Add text
      parent.appendChild(textElement)

      // Remove input
      parent.removeChild(currentElement)
    } else {
      // Get all styling for print element
      currentElement.setAttribute('style', collectStyles(currentElement, params))
    }

    // Check if more elements in tree
    let children = currentElement.children

    if (children && children.length) {
      loopNodesCollectStyles(children, params)
    }
  }
}

export function addHeader (printElement, header, headerStyle) {
  // Create header element
  let headerElement = document.createElement('h1')

  // Create header text node
  let headerNode = document.createTextNode(header)

  // Build and style
  headerElement.appendChild(headerNode)
  headerElement.setAttribute('style', headerStyle)

  printElement.insertBefore(headerElement, printElement.childNodes[0])
}
