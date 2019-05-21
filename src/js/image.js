import { addHeader } from './functions'
import Print from './print'

export default {
  print: (params, printFrame) => {
    // Check if we are printing one image or multiple images
    if (params.printable.constructor !== Array) {
      // Create array with one image
      params.printable = [params.printable]
    }

    // Create printable element (container)
    let printableElement = document.createElement('div')
    printableElement.setAttribute('style', 'width:100%')

    // Create all image elements and append them to the printable container
    params.printable.forEach(src => {
      // Create the image element
      let img = document.createElement('img')

      // Set image src with the file url
      img.src = src

      // Create the image wrapper
      let imageWrapper = document.createElement('div')
      imageWrapper.setAttribute('style', params.imageStyle)

      // Append image to the wrapper element
      imageWrapper.appendChild(img)

      // Append wrapper to the printable element
      printableElement.appendChild(imageWrapper)
    })

    // Check if we are adding a print header
    if (params.header) addHeader(printableElement, params.header, params.headerStyle)

    // Store html data
    params.htmlData = printableElement.outerHTML

    // Print image
    Print.send(params, printFrame)
  }
}
