import { addHeader } from './functions'
import Browser from './browser'
import Print from './print'

export default {
  print: (params, printFrame) => {
    // Create the image element
    let img = document.createElement('img')

    // Set image src with image file url
    img.src = params.printable

    img.setAttribute('style', 'width:100%;')
    img.setAttribute('id', 'printableImage')

    // Create wrapper
    let printableElement = document.createElement('div')
    printableElement.setAttribute('style', 'width:100%')

    // To prevent firefox from not loading images within iframe, we can use base64-encoded data URL of images pixel data
    if (Browser.isFirefox()) {
      // Let's make firefox happy
      let canvas = document.createElement('canvas')
      canvas.setAttribute('width', img.width)
      canvas.setAttribute('height', img.height)
      let context = canvas.getContext('2d')
      context.drawImage(img, 0, 0)

      // Reset img src attribute with canvas dataURL
      img.setAttribute('src', canvas.toDataURL('JPEG', 1.0))
    }

    printableElement.appendChild(img)

    // Check if we are adding a header for the image
    if (params.header) {
      addHeader(printableElement)
    }

    // Store html data
    params.htmlData = printableElement.outerHTML

    // Print image
    Print.send(params, printFrame)
  }
}
