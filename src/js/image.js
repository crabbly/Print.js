import { addHeader } from './functions'
import browser from './browser'

export default function (PrintJS) {
  PrintJS.prototype.image = function () {
        // create the image element
    let img = document.createElement('img')
    img.setAttribute('style', 'width:100%;')
    img.setAttribute('id', 'printableImage')

        // set image src with image file url
    img.src = this.params.printable

        // create wrapper
    let printableElement = document.createElement('div')
    printableElement.setAttribute('style', 'width:100%')

        // to prevent firefox from not loading images within iframe, we can use base64-encoded data URL of images pixel data
    if (browser.isFirefox()) {
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
    if (this.params.header) {
      addHeader(printableElement)
    }

        // store html data
    this.params.htmlData = printableElement.outerHTML

        // print image
    this.print()
  }
}
