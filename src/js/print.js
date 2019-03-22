import Browser from './browser'
import { cleanUp } from './functions'

const Print = {
  send: (params, printFrame) => {
    // Append iframe element to document body
    document.getElementsByTagName('body')[0].appendChild(printFrame)

    // Get iframe element
    let iframeElement = document.getElementById(params.frameId)

    // Wait for iframe to load all content
    if (params.type === 'pdf' && (Browser.isIE() || Browser.isEdge())) {
      iframeElement.setAttribute('onload', performPrint(iframeElement, params))
    } else {
      printFrame.onload = () => {
        if (params.type === 'pdf') {
          performPrint(iframeElement, params)
        } else {
          // Get iframe element document
          let printDocument = (iframeElement.contentWindow || iframeElement.contentDocument)
          if (printDocument.document) printDocument = printDocument.document

          // Inject printable html into iframe body
          printDocument.body.innerHTML = params.htmlData

          // Add custom style
          if (params.type !== 'pdf' && params.style !== null) {
            // Create style element
            const style = document.createElement('style')
            style.innerHTML = params.style

            // Append style element to iframe's head
            printDocument.head.appendChild(style)
          }

          // If printing image, wait for it to load inside the iframe
          if (params.type === 'image') {
            loadIframeImages(printDocument, params).then(() => {
              performPrint(iframeElement, params)
            })
          } else {
            performPrint(iframeElement, params)
          }
        }
      }
    }
  }
}

function performPrint (iframeElement, params) {
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
    cleanUp(params)
  }
}

function loadIframeImages (printDocument, params) {
  let promises = []

  params.printable.forEach((image, index) => promises.push(loadIframeImage(printDocument, index)))

  return Promise.all(promises)
}

function loadIframeImage (printDocument, index) {
  return new Promise(resolve => {
    const pollImage = () => {
      let image = printDocument ? printDocument.getElementById('printableImage' + index) : null

      if (!image || typeof image.naturalWidth === 'undefined' || image.naturalWidth === 0) {
        setTimeout(pollImage, 500)
      } else {
        resolve()
      }
    }
    pollImage()
  })
}

export default Print
