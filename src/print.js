/*
 * Print.js
 * http://printjs.crabbly.com
 * Version: 1.0.5
 *
 * Copyright 2016 Rodrigo Vieira (@crabbly)
 * Released under the MIT license
 * https://github.com/crabbly/Print.js/blob/master/LICENSE
 */

(function (window, document) {
  'use strict'

  var printTypes = ['pdf', 'html', 'image', 'json']

  let defaultParams = {
    printable: null,
    type: 'pdf',
    header: null,
    maxWidth: 800,
    font: 'TimesNewRoman',
    font_size: '12pt',
    honorMarginPadding: true,
    honorColor: false,
    properties: null,
    showModal: false,
    modalMessage: 'Retrieving Document...',
    frameId: 'printJS',
    border: true,
    htmlData: ''
  }

  // print friendly defaults
  let printFriendlyElement = 'max-width: ' + defaultParams.maxWidth + 'px !important;' + defaultParams.font_size + ' !important;'
  let bodyStyle = 'font-family:' + defaultParams.font + ' !important; font-size: ' + defaultParams.font_size + ' !important; width:100%;'
  let headerStyle = 'font-weight:300;'

  // occupy the global variable of printJS
  window.printJS = function () {
    // check if a printable document or object was supplied
    if (arguments[0] === undefined) {
      window.console.error('printJS expects at least 1 attribute.')
      return false
    }

    // instantiate print object
    let printJS = new PrintJS(arguments)

    // check printable type
    switch (printJS.params.type) {
      case 'pdf':
        // firefox doesn't support iframe printing, we will just open the pdf file instead
        if (isFirefox()) {
          console.log('PrintJS doesn\'t support PDF printing in Firefox.')
          let win = window.open(printJS.params.printable, '_blank')
          win.focus()
          // make sure there is no message modal opened
          if (printJS.params.showModal) printJS.disablePrintModal()
        } else {
          printJS.pdf()
        }
        break
      case 'image':
        printJS.image()
        break
      case 'html':
        printJS.html()
        break
      case 'json':
        printJS.json()
        break
      default:
        throw new Error('Invalid printable type')
    }
  }

  // printJS class
  let PrintJS = function () {
    let args = arguments[0]

    let print = this

    print.params = extend({}, defaultParams)

    switch (typeof args[0]) {
      case 'string':
        print.params.printable = encodeURI(args[0])
        print.params.type = args[1] || defaultParams.type
        break

      case 'object':
        print.params.printable = args[0].printable
        print.params.type = args[0].type || defaultParams.type
        print.params.frameId = args[0].frameId || defaultParams.frameId
        print.params.header = args[0].header || defaultParams.header
        print.params.maxWidth = args[0].maxWidth || defaultParams.maxWidth
        print.params.font = args[0].font || defaultParams.font
        print.params.font_size = args[0].font_size || defaultParams.font_size
        print.params.honorMarginPadding = (typeof args[0].honorMarginPadding !== 'undefined') ? args[0].honorMarginPadding : defaultParams.honorMarginPadding
        print.params.properties = args[0].properties || defaultParams.properties
        print.params.showModal = (typeof args[0].showModal !== 'undefined') ? args[0].showModal : defaultParams.showModal
        print.params.modalMessage = args[0].modalMessage || defaultParams.modalMessage
        break

      default:
        throw new Error('Unexpected argument type! Expected "string" or "object", got ' + typeof args[0])
    }

    // some validation
    print.validateInput()

    // check if showing feedback to user (useful for large files)
    if (print.params.showModal) {
      print.showModal()
    }

    // to prevent duplication and issues, remove print.printFrame from DOM, if it exists.
    let usedFrame = document.getElementById(print.params.frameId)

    if (usedFrame) {
      usedFrame.parentNode.removeChild(usedFrame)
    }

    // create a new iframe element
    print.printFrame = document.createElement('iframe')

    // when printing pdf in IE, we use embed instead
    if (isIE() && print.params.type === 'pdf') {
      print.printFrame = document.createElement('embed')
      print.printFrame.setAttribute('type', 'application/pdf')
    }

    // hide element (when using embed, can't use display:none, set height and width to 0 instead)
    (isIE() && print.params.type === 'pdf') ? print.printFrame.setAttribute('style', 'width:0px;height:0px;') : print.printFrame.setAttribute('style', 'display:none;')

    // set element id
    print.printFrame.setAttribute('id', print.params.frameId)

    // for non pdf printing, pass empty html document to srcdoc (force onload callback)
    if (print.params.type !== 'pdf') print.printFrame.srcdoc = '<html><head></head><body></body></html>'
  }

  PrintJS.prototype.pdf = function () {
    const print = this

    // if showing feedback to user, pre load pdf files (hacky)
    // since we will be using promises, we can't use this feature in IE
    if (print.params.showModal && !isIE()) {
      let pdfObject = document.createElement('img')
      pdfObject.src = print.params.printable

      let pdf = new Promise(function (resolve, reject) {
        let loadPDF = setInterval(checkPDFload, 100)

        function checkPDFload () {
          if (pdfObject.complete) {
            window.clearInterval(loadPDF)
            resolve('PrintJS: PDF loaded. Read to print.')
          }
        }
      })

      pdf.then(function (result) {
        console.log(result)
        print.printFrame.setAttribute('src', print.params.printable)
        print.print()
      })
    } else {
      print.printFrame.setAttribute('src', print.params.printable)
      print.print()
    }
  }

  PrintJS.prototype.image = function () {
    // create the image element
    let img = document.createElement('img')
    img.setAttribute('style', 'width:100%;')
    img.src = this.params.printable

    // assign `this` to a variable, to be used within the promise
    let print = this

    // if browser isn't IE, load image using promises
    if (!isIE()) {
      let loadImage = new Promise(function (resolve, reject) {
        let loadPrintableImg = setInterval(checkImgLoad, 100)

        function checkImgLoad () {
          if (img.complete) {
            window.clearInterval(loadPrintableImg)
            resolve('PrintJS: Image loaded. Read to print.')
          }
        }
      })

      loadImage.then(function (result) {
        console.log(result)
        printImage()
      })
    } else {
      printImage()
    }

    function printImage () {
      // create wrapper
      let printableElement = document.createElement('div')
      printableElement.setAttribute('style', 'width:100%')

      // to prevent firefox from not loading the image within iframe, we can use a base64-encoded data URL of the image pixel data
      if (isFirefox) {
        // let's make firefox happy
        let canvas = document.createElement('canvas')
        canvas.setAttribute('width', img.width)
        canvas.setAttribute('height', img.height)
        let context = canvas.getContext('2d')
        context.drawImage(img, 0, 0)

        // reset img src attribute with canvas dataURL
        img.setAttribute('src', canvas.toDataURL('JPEG', 1.0))
      }

      printableElement.appendChild(img)

      // add header if any
      if (print.params.header) {
        print.addHeader(printableElement)
      }

      // store html data
      print.params.htmlData = printableElement.outerHTML

      print.print()
    }
  }

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
    printableElement.setAttribute('style', this.collectStyles(printableElement) + 'margin:0 !important;')

    // get all children elements
    let elements = printableElement.children

    // get styles for all children elements
    this.loopNodesCollectStyles(elements)

    // add header if any
    if (this.params.header) {
      this.addHeader(printableElement)
    }

    // remove DOM printableElement
    printableElement.parentNode.removeChild(printableElement)

    // store html data
    this.params.htmlData = addWrapper(printableElement.innerHTML)

    this.print()
  }

  PrintJS.prototype.json = function () {
    // check if we received proper data
    if (typeof this.params.printable !== 'object') {
      throw new Error('Invalid javascript data object (JSON).')
    }

    // check if properties were provided
    if (!this.params.properties || typeof this.params.properties !== 'object') {
      throw new Error('Invalid properties array for your JSON data.')
    }

    // variable to hold html string
    let htmlData = ''

    // check print has header
    if (this.params.header) {
      htmlData += '<h1 style="' + headerStyle + '">' + this.params.header + '</h1>'
    }

    // function to build html templates for json data
    htmlData += this.jsonToHTML()

    // store html data
    this.params.htmlData = addWrapper(htmlData)

    this.print()
  }

  PrintJS.prototype.print = function () {
    let print = this

    // append iframe element to document body
    document.getElementsByTagName('body')[0].appendChild(print.printFrame)

    // get iframe element
    let printJS = document.getElementById(print.params.frameId)

    // if printing pdf in IE
    if (isIE() && print.params.type === 'pdf') {
      finishPrintPdfIe()
    } else {
      // wait for iframe to load all content
      print.printFrame.onload = function () {
        if (print.params.type === 'pdf') {
          finishPrint()
        } else {
          // get iframe element document
          let printDocument = (printJS.contentWindow || printJS.contentDocument)
          if (printDocument.document) printDocument = printDocument.document

          // inject printable html into iframe body
          printDocument.body.innerHTML = print.params.htmlData

          finishPrint()
        }
      }
    }

    function finishPrint () {
      // print iframe document
      printJS.focus()

      // if IE, try catch with execCommand
      if (isIE() && print.params.type !== 'pdf') {
        try {
          printJS.contentWindow.document.execCommand('print', false, null)
        } catch (e) {
          printJS.contentWindow.print()
        }
      } else {
        printJS.contentWindow.print()
      }

      // if showing feedback to user, remove processing message (close modal)
      if (print.params.showModal) {
        print.disablePrintModal()
      }
    }

    function finishPrintPdfIe () {
      // wait until pdf is ready to print
      if (typeof printJS.print === 'undefined') {
        setTimeout(function () { finishPrintPdfIe() }, 1000)
      } else {
        printJS.print()

        // remove embed (just because it isn't 100% hidden when using h/w = 0)
        setTimeout(function () { printJS.parentNode.removeChild(printJS) }, 2000)
      }
    }
  }

  PrintJS.prototype.collectStyles = function (element) {
    let win = document.defaultView || window

    let style = []

    // string variable to hold styling for each element
    let elementStyle = ''

    if (win.getComputedStyle) { // modern browsers
      style = win.getComputedStyle(element, '')

      for (let i = 0; i < style.length; i++) {
        // styles including
        let targetStyles = ['border', 'float', 'box']
        // exact
        let targetStyle = ['clear', 'display', 'width', 'min-width', 'height', 'min-height', 'max-height']

        // optinal - include margin and padding
        if (this.params.honorMarginPadding) {
          targetStyle.push('margin', 'padding')
        }

        // optinal - include color
        if (this.params.honorColor) {
          targetStyle.push('color')
        }

        for (let s = 0; s < targetStyle.length; s++) {
          if (style[i].indexOf(targetStyles[s]) !== -1 || style[i].indexOf(targetStyle[s]) === 0) {
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

    // add printer friendly
    elementStyle += printFriendlyElement

    return elementStyle
  }

  PrintJS.prototype.loopNodesCollectStyles = function (elements) {
    for (let n = 0; n < elements.length; n++) {
      let currentElement = elements[n]

      // Form Printing - check if is element Input
      let tag = currentElement.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        // save style to variable
        let textStyle = this.collectStyles(currentElement)

        // remove INPUT element and insert a text node
        let parent = currentElement.parentNode

        // get text value
        let textNode = tag === 'SELECT'
          ? document.createTextNode(currentElement.options[currentElement.selectedIndex].text)
          : document.createTextNode(currentElement.value)

        // create text element
        let textElement = document.createElement('div')
        textElement.appendChild(textNode)

        // add style to text
        textElement.setAttribute('style', textStyle)

        // add text
        parent.appendChild(textElement)

        // remove input
        parent.removeChild(currentElement)
      } else {
        // get all styling for print element
        currentElement.setAttribute('style', this.collectStyles(currentElement))
      }

      // check if more elements in tree
      let children = currentElement.children

      if (children.length) {
        this.loopNodesCollectStyles(children)
      }
    }
  }

  PrintJS.prototype.addHeader = function (printElement) {
    // create header element
    let headerElement = document.createElement('h1')

    // create header text node
    let headerNode = document.createTextNode(this.params.header)

    // build and style
    headerElement.appendChild(headerNode)
    headerElement.setAttribute('style', headerStyle)

    printElement.insertBefore(headerElement, printElement.childNodes[0])
  }

  PrintJS.prototype.jsonToHTML = function () {
    let data = this.params.printable
    let properties = this.params.properties

    let htmlData = '<div style="display:flex; flex-direction: column;">'

    // header
    htmlData += '<div style="flex:1; display:flex;">'

    for (let a = 0; a < properties.length; a++) {
      htmlData += '<div style="flex:1; padding:5px;">' + capitalizePrint(properties[a]) + '</div>'
    }

    htmlData += '</div>'

    // create html data
    for (let i = 0; i < data.length; i++) {
      htmlData += '<div style="flex:1; display:flex;'
      htmlData += this.params.border ? 'border:1px solid lightgray;' : ''
      htmlData += '">'

      for (let n = 0; n < properties.length; n++) {
        htmlData += '<div style="flex:1; padding:5px;">' + data[i][properties[n]] + '</div>'
      }

      htmlData += '</div>'
    }

    htmlData += '</div>'

    return htmlData
  }

  PrintJS.prototype.validateInput = function () {
    if (!this.params.printable) {
      throw new Error('Missing printable information.')
    }

    if (!this.params.type || typeof this.params.type !== 'string' || printTypes.indexOf(this.params.type.toLowerCase()) === -1) {
      throw new Error('Invalid print type. Available types are: pdf, html, image and json.')
    }
  }

  PrintJS.prototype.showModal = function () {
    // build modal
    let modalStyle = 'font-family:sans-serif; ' +
      'display:table; ' +
      'text-align:center; ' +
      'font-weight:300; ' +
      'font-size:30px; ' +
      'left:0; top:0;' +
      'position:fixed; ' +
      'z-index: 9990;' +
      'color: #0460B5; ' +
      'width: 100%; ' +
      'height: 100%; ' +
      'background-color:rgba(255,255,255,.9);' +
      'transition: opacity .3s ease;'

    // create wrapper
    let printModal = document.createElement('div')
    printModal.setAttribute('style', modalStyle)
    printModal.setAttribute('id', 'printJS-Modal')

    // create content div
    let contentDiv = document.createElement('div')
    contentDiv.setAttribute('style', 'display:table-cell; vertical-align:middle; padding-bottom:100px;')

    // add close button (requires print.css)
    let closeButton = document.createElement('div')
    closeButton.setAttribute('class', 'printClose')
    closeButton.setAttribute('id', 'printClose')
    contentDiv.appendChild(closeButton)

    // add spinner (requires print.css)
    let spinner = document.createElement('span')
    spinner.setAttribute('class', 'printSpinner')
    contentDiv.appendChild(spinner)

    // add message
    let messageNode = document.createTextNode(this.params.modalMessage)
    contentDiv.appendChild(messageNode)

    // add contentDiv to printModal
    printModal.appendChild(contentDiv)

    // append print modal element to document body
    document.getElementsByTagName('body')[0].appendChild(printModal)

    // add event listener to close button
    let print = this
    document.getElementById('printClose').addEventListener('click', function () {
      print.disablePrintModal()
    })
  }

  PrintJS.prototype.disablePrintModal = function () {
    let printFrame = document.getElementById('printJS-Modal')

    printFrame.parentNode.removeChild(printFrame)
  }

  function addWrapper (htmlData) {
    return '<div style="' + bodyStyle + '">' + htmlData + '</div>'
  }

  // update default print.params with user input
  function extend (a, b) {
    for (let key in b) {
      if (b.hasOwnProperty(key)) {
        a[key] = b[key]
      }
    }

    return a
  }

  // capitalize string
  function capitalizePrint (string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  // check user's browser
  function isFirefox () {
    return typeof InstallTrigger !== 'undefined'
  }

  function isIE () {
    return !!document.documentMode
  }
})(window, document)
