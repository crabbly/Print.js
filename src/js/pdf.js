import Print from './print'
import { cleanUp } from './functions'

export default {
  print: (params, printFrame) => {
    // Check if we have base64 data
    if (params.base64) {
      const bytesArray = Uint8Array.from(atob(params.printable), c => c.charCodeAt(0))
      createBlobAndPrint(params, printFrame, bytesArray)
      return
    }

    // Format pdf url
    params.printable = /^(blob|http|\/\/)/i.test(params.printable)
      ? params.printable
      : window.location.origin + (params.printable.charAt(0) !== '/' ? '/' + params.printable : params.printable)

    // Get the file through a http request (Preload)
    const req = new window.XMLHttpRequest()
    req.responseType = 'arraybuffer'

    req.addEventListener('error', () => {
      cleanUp(params)
      params.onError(req.statusText)

      // Since we don't have a pdf document available, we will stop the print job
    })

    req.addEventListener('load', () => {
      // Check for errors
      if ([200, 201].indexOf(req.status) === -1) {
        cleanUp(params)
        params.onError(req.statusText)

        // Since we don't have a pdf document available, we will stop the print job
        return
      }

      // Print requested document
      createBlobAndPrint(params, printFrame, req.response)
    })

    req.open('GET', params.printable, true)
    req.send()
  }
}

function createBlobAndPrint (params, printFrame, data) {
  // Pass response or base64 data to a blob and create a local object url
  let localPdf = new window.Blob([data], { type: 'application/pdf' })
  localPdf = window.URL.createObjectURL(localPdf)

  // Set iframe src with pdf document url
  printFrame.setAttribute('src', localPdf)

  Print.send(params, printFrame)
}
