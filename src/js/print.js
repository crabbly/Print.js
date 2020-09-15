import Browser from './browser'
import { cleanUp } from './functions'

const Print = {
  send: (params, printFrame) => {
    // Append iframe element to document body
    document.getElementsByTagName('body')[0].appendChild(printFrame)

    // Get iframe element
    const iframeElement = document.getElementById(params.frameId)

    const performPrint = function () {
      try {
        iframeElement.focus()

        // If Edge or IE, try catch with execCommand
        if (Browser.isEdge() || Browser.isIE()) {
          try {
            iframeElement.contentWindow.document.execCommand('print', false, null)
          } catch (e) {
            iframeElement.contentWindow.print()
          }
        } else {
          // Other browsers
          iframeElement.contentWindow.print()
        }
      } catch (error) {
        params.onError(error)
      } finally {
        // Move the iframe element off-screen and make it invisible
        iframeElement.style.visibility = 'hidden'
        iframeElement.style.left = '-1px'

        cleanUp(params)
      }
    }

    // Wait for iframe to load all content
    iframeElement.onload = () => {
      if (params.type === 'pdf') {
        // Add a delay for Firefox. In my tests, 1000ms was sufficient but 100ms was not
        if (Browser.isFirefox()) {
          setTimeout(performPrint, 1000)
        } else {
          performPrint()
        }
        return
      }

      // Get iframe element document
      let printDocument = (iframeElement.contentWindow || iframeElement.contentDocument)
      if (printDocument.document) printDocument = printDocument.document

      // Append printable element to the iframe body
      printDocument.body.appendChild(params.printableElement)

      // Add custom style
      if (params.style) {
        // Create style element
        const style = document.createElement('style')
        style.innerHTML = params.style

        // Append style element to iframe's head
        printDocument.head.appendChild(style)
      }

      // If printing images, wait for them to load inside the iframe
      const images = printDocument.getElementsByTagName('img')

      if (images.length > 0) {
        loadIframeImages(Array.from(images)).then(performPrint)
      } else {
        performPrint()
      }
    }
  }
}

function loadIframeImages (images) {
  const promises = images.map(image => {
    if (image.src && image.src !== window.location.href) {
      return loadIframeImage(image)
    }
  })

  return Promise.all(promises)
}

function loadIframeImage (image) {
  return new Promise(resolve => {
    const pollImage = () => {
      !image || typeof image.naturalWidth === 'undefined' || image.naturalWidth === 0 || !image.complete
        ? setTimeout(pollImage, 500)
        : resolve()
    }
    pollImage()
  })
}

export default Print
