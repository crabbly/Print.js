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

    // Load images and append
    loadImagesAndAppendToPrintableElement(printableElement, params).then(() => {
      // Check if we are adding a header
      if (params.header) addHeader(printableElement, params.header, params.headerStyle)

      // Store html data
      params.htmlData = printableElement.outerHTML

      // Print image
      Print.send(params, printFrame)
    })
  }
}

function loadImagesAndAppendToPrintableElement (printableElement, params) {
  let promises = []

  params.printable.forEach((image, index) => {
    // Create the image element
    let img = document.createElement('img')

    // Set image src with image file url
    img.src = image

    // Load image
    promises.push(loadImageAndAppendToPrintableElement(printableElement, params, img, index))
  })

  return Promise.all(promises)
}

function loadImageAndAppendToPrintableElement (printableElement, params, img, index) {
  return new Promise(resolve => {
    img.onload = () => {
      // Create image wrapper
      let imageWrapper = document.createElement('div')
      imageWrapper.setAttribute('style', params.imageStyle)

      img.setAttribute('style', 'width:100%;')
      img.setAttribute('id', 'printableImage' + index)

      // Append image to wrapper element
      imageWrapper.appendChild(img)

      // Append wrapper element to printable element
      printableElement.appendChild(imageWrapper)

      resolve()
    }
  })
}
