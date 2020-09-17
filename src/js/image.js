import { addHeader } from './functions'
import Print from './print'
import Browser from './browser'

export default {
  print: (params, printFrame) => {
    // Check if we are printing one image or multiple images
    if (params.printable.constructor !== Array) {
      // Create array with one image
      params.printable = [params.printable]
    }

    // Create printable element (container)
    params.printableElement = document.createElement('div')

    // Create all image elements and append them to the printable container
    params.printable.forEach(src => {
      // Create the image element
      const img = document.createElement('img')
      img.setAttribute('style', params.imageStyle)

      // Set image src with the file url
      img.src = src

      // The following block is for Firefox, which for some reason requires the image's src to be fully qualified in
      // order to print it
      if (Browser.isFirefox()) {
        const fullyQualifiedSrc = img.src
        img.src = fullyQualifiedSrc
      }

      // Create the image wrapper
      const imageWrapper = document.createElement('div')

      // Append image to the wrapper element
      imageWrapper.appendChild(img)

      // Append wrapper to the printable element
      params.printableElement.appendChild(imageWrapper)
    })

    // Check if we are adding a print header
    if (params.header) addHeader(params.printableElement, params)

    // Print image
    Print.send(params, printFrame)
  }
}
