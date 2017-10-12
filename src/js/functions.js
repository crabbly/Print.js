export function addWrapper (htmlData, params) {
  let bodyStyle = 'font-family:' + params.font + ' !important; font-size: ' + params.font_size + ' !important; width:100%;'
  return '<div style="' + bodyStyle + '">' + htmlData + '</div>'
}

export function capitalizePrint (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export function collectStyles (element, params) {
  let win = document.defaultView || window

  let style = []

  // String variable to hold styling for each element
  let elementStyle = ''

  if (win.getComputedStyle) { // Modern browsers
    style = win.getComputedStyle(element, '')

    // Styles including
    let targetStyles = ['border', 'box', 'break', 'text-decoration']

    // Exact match
    let targetStyle = ['clear', 'display', 'width', 'min-width', 'height', 'min-height', 'max-height']

    // Optional - include margin and padding
    if (params.honorMarginPadding) {
      targetStyles.push('margin', 'padding')
    }

    // Optional - include color
    if (params.honorColor) {
      targetStyles.push('color')
    }

    for (let i = 0; i < style.length; i++) {
      for (let s = 0; s < targetStyles.length; s++) {
        if (style[i].indexOf(targetStyles[s]) !== -1 || targetStyle.indexOf(style[i]) !== -1) {
          elementStyle += style[i] + ':' + style.getPropertyValue(style[i]) + ';'
        }
      }
    }
  } else if (element.currentStyle) { // IE
    style = element.currentStyle

    for (let name in style) {
      if (style.indexOf('border') !== -1 && style.indexOf('color') !== -1) {
        elementStyle += name + ':' + style[name] + ';'
      }
    }
  }

  // Print friendly defaults
  elementStyle += 'max-width: ' + params.maxWidth + 'px !important;' + params.font_size + ' !important;'

  return elementStyle
}

export function loopNodesCollectStyles (elements, params) {
  for (let n = 0; n < elements.length; n++) {
    let currentElement = elements[n]

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
