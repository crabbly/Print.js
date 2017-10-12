import { addHeader } from './functions'
import Print from './print'

export default {
  print: (params, printFrame) => {
    // Create the image element
    let img = document.createElement('img')

    // Set image src with image file url
    img.src = params.printable

    // Load image
    img.onload = () => {
      img.setAttribute('style', 'width:100%;')
      img.setAttribute('id', 'printableImage')

      // Create wrapper
      let printableElement = document.createElement('div')
      printableElement.setAttribute('style', 'width:100%')
      printableElement.appendChild(img)

      // Check if we are adding a header for the image
      if (params.header) {
        addHeader(printableElement, params.header, params.headerStyle)
      }

      // Store html data
      params.htmlData = printableElement.outerHTML

      // Print image
      Print.send(params, printFrame)
    }
  }
}
