'use strict'

import Browser from './browser'
import Modal from './modal'
import Pdf from './pdf'
import Html from './html'
import Image from './image'
import Json from './json'

let printTypes = ['pdf', 'html', 'image', 'json']

export default {
  init () {
    let params = {
      printable: null,
      fallbackPrintable: null,
      type: 'pdf',
      header: null,
      headerStyle: 'font-weight: 300;',
      maxWidth: 800,
      font: 'TimesNewRoman',
      font_size: '12pt',
      honorMarginPadding: true,
      honorColor: false,
      properties: null,
      gridHeaderStyle: 'font-weight: bold;',
      gridStyle: 'border: 1px solid lightgray; margin-bottom: -1px;',
      showModal: false,
      onLoadingStart: function () {},
      onLoadingEnd: function () {},
      modalMessage: 'Retrieving Document...',
      frameId: 'printJS',
      htmlData: '',
      documentTitle: 'Document'
    }

    // Check if a printable document or object was supplied
    let args = arguments[0]
    if (args === undefined) {
      throw new Error('printJS expects at least 1 attribute.')
    }

    switch (typeof args) {
      case 'string':
        params.printable = encodeURI(args)
        params.fallbackPrintable = params.printable
        params.type = arguments[1] || params.type
        break

      case 'object':
        params.printable = args.printable
        params.fallbackPrintable = typeof args.fallbackPrintable !== 'undefined' ? args.fallbackPrintable : params.printable
        params.type = typeof args.type !== 'undefined' ? args.type : params.type
        params.frameId = typeof args.frameId !== 'undefined' ? args.frameId : params.frameId
        params.header = typeof args.header !== 'undefined' ? args.header : params.header
        params.headerStyle = typeof args.headerStyle !== 'undefined' ? args.headerStyle : params.headerStyle
        params.maxWidth = typeof args.maxWidth !== 'undefined' ? args.maxWidth : params.maxWidth
        params.font = typeof args.font !== 'undefined' ? args.font : params.font
        params.font_size = typeof args.font_size !== 'undefined' ? args.font_size : params.font_size
        params.honorMarginPadding = typeof args.honorMarginPadding !== 'undefined' ? args.honorMarginPadding : params.honorMarginPadding
        params.properties = typeof args.properties !== 'undefined' ? args.properties : params.properties
        params.gridHeaderStyle = typeof args.gridHeaderStyle !== 'undefined' ? args.gridHeaderStyle : params.gridHeaderStyle
        params.gridStyle = typeof args.gridStyle !== 'undefined' ? args.gridStyle : params.gridStyle
        params.showModal = typeof args.showModal !== 'undefined' ? args.showModal : params.showModal
        params.onLoadingStart = typeof args.onLoadingStart !== 'undefined' ? args.onLoadingStart : params.onLoadingStart
        params.onLoadingEnd = typeof args.onLoadingEnd !== 'undefined' ? args.onLoadingEnd : params.onLoadingEnd
        params.modalMessage = typeof args.modalMessage !== 'undefined' ? args.modalMessage : params.modalMessage
        params.documentTitle = typeof args.documentTitle !== 'undefined' ? args.documentTitle : params.documentTitle
        break
      default:
        throw new Error('Unexpected argument type! Expected "string" or "object", got ' + typeof args)
    }

    if (!params.printable) {
      throw new Error('Missing printable information.')
    }

    if (!params.type || typeof params.type !== 'string' || printTypes.indexOf(params.type.toLowerCase()) === -1) {
      throw new Error('Invalid print type. Available types are: pdf, html, image and json.')
    }

    // Check if we are showing a feedback message to the user (useful for large files)
    if (params.showModal) {
      Modal.show(params)
    }
    if (params.onLoadingStart) {
      params.onLoadingStart()
    }

    // To prevent duplication and issues, remove printFrame from the DOM, if it exists
    let usedFrame = document.getElementById(params.frameId)

    if (usedFrame) {
      usedFrame.parentNode.removeChild(usedFrame)
    }

    // Create a new iframe or embed element (IE prints blank pdf's if we use iframe)
    let printFrame

    // Create iframe element
    printFrame = document.createElement('iframe')

    // Hide iframe
    printFrame.setAttribute('style', 'display:none;')

    // Set element id
    printFrame.setAttribute('id', params.frameId)

    // For non pdf printing, pass an empty html document to srcdoc (force onload callback)
    if (params.type !== 'pdf') {
      printFrame.srcdoc = '<html><head><title>' + params.documentTitle + '</title></head><body></body></html>'
    }

    // Check printable type
    switch (params.type) {
      case 'pdf':
        // Check browser support for pdf and if not supported we will just open the pdf file instead
        if (Browser.isFirefox() || Browser.isEdge() || Browser.isIE()) {
          console.log('PrintJS currently doesn\'t support PDF printing in Firefox, Internet Explorer and Edge.')
          let win = window.open(params.fallbackPrintable, '_blank')
          win.focus()
          // Make sure there is no loading modal opened
          if (params.showModal) Modal.close()
          if (params.onLoadingEnd) params.onLoadingEnd()
        } else {
          Pdf.print(params, printFrame)
        }
        break
      case 'image':
        Image.print(params, printFrame)
        break
      case 'html':
        Html.print(params, printFrame)
        break
      case 'json':
        Json.print(params, printFrame)
        break
      default:
        throw new Error('Invalid print type. Available types are: pdf, html, image and json.')
    }
  }
}

