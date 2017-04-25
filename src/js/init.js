'use strict'

import browser from './browser'
import { extend } from './functions'
import PrintJS from './class'
import pdf from './pdf'
import html from './html'
import image from './image'
import json from './json'
import print from './print'
import modal from './modal'
pdf(PrintJS)
image(PrintJS)
html(PrintJS)
json(PrintJS)
print(PrintJS)
modal(PrintJS)

let printTypes = ['pdf', 'html', 'image', 'json']

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

export default {
  init () {
      // Check if a printable document or object was supplied
    let args = arguments[0]
    if (args === undefined) {
      throw new Error('printJS expects at least 1 attribute.')
    }

    let params = extend({}, defaultParams)

    switch (typeof args) {
      case 'string':
        params.printable = encodeURI(args)
        params.type = arguments[1] || defaultParams.type
        break

      case 'object':
        params.printable = args.printable
        params.type = args.type || defaultParams.type
        params.frameId = args.frameId || defaultParams.frameId
        params.header = args.header || defaultParams.header
        params.maxWidth = args.maxWidth || defaultParams.maxWidth
        params.font = args.font || defaultParams.font
        params.font_size = args.font_size || defaultParams.font_size
        params.honorMarginPadding = (typeof args.honorMarginPadding !== 'undefined') ? args.honorMarginPadding : defaultParams.honorMarginPadding
        params.properties = args.properties || defaultParams.properties
        params.showModal = (typeof args.showModal !== 'undefined') ? args.showModal : defaultParams.showModal
        params.modalMessage = args.modalMessage || defaultParams.modalMessage
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

      // Instantiate print object
    let printJS = new PrintJS(params)

      // Check printable type
    switch (params.type) {
      case 'pdf':
              // Firefox doesn't support iframe pdf printing, we will just open the pdf file instead
        if (browser.isFirefox()) {
          console.log('PrintJS doesn\'t support PDF printing in Firefox.')
          let win = window.open(params.printable, '_blank')
          win.focus()
                  // Make sure there is no loading modal opened
          if (params.showModal) printJS.disablePrintModal()
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
        throw new Error('Invalid print type. Available types are: pdf, html, image and json.')
    }
  }
}

