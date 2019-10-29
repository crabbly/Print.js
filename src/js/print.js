import Browser from './browser'
import { cleanUp } from './functions'

const Print = {
  send: (params, printFrame) => {
    // Append iframe element to document body
    document.getElementsByTagName('body')[0].appendChild(printFrame)

    // Get iframe element
    const iframeElement = document.getElementById(params.frameId)

    // Wait for iframe to load all content
    iframeElement.onload = () => {
      if (params.type === 'pdf') {
        performPrint(iframeElement, params)
        return
      }

      // Get iframe element document
      let printDocument = (iframeElement.contentWindow || iframeElement.contentDocument)
      if (printDocument.document) printDocument = printDocument.document

      // Append printable element to the iframe body
      printDocument.body.appendChild(params.printableElement)
      // IE does not support the srcdoc attribute of iframe tag. The previous CSS file does not take effect.
      if (Browser.isIE()){
        if (params.css) {
          var linkElement = document.createElement('link');//printDocument.getElementsByTagName('head')[0].innerHTML;
          // Add support for single file
          if (!Array.isArray(params.css)) params.css = [params.css]
          // Create link tags for each css file
          params.css.forEach(file => {
            linkElement.setAttribute("rel","stylesheet")
            linkElement.setAttribute("href",file)
            //IE9 does not support innerHtml
            printDocument.getElementsByTagName('head')[0].appendChild(linkElement) ;
          })
        }
      }
      // Add custom style
      if (params.type !== 'pdf' && params.style) {
        // Create style element
        const style = document.createElement('style')
        style.innerHTML = params.style

        // Append style element to iframe's head
        printDocument.head.appendChild(style)
      }

      // If printing images, wait for them to load inside the iframe
      const images = printDocument.getElementsByTagName('img')

      if (images.length > 0) {
        loadIframeImages(images).then(() => performPrint(iframeElement, params))
      } else {
        performPrint(iframeElement, params)
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
