import Print from './print'
import { cleanUp } from './functions'

export default {
  print: (params, printFrame) => {
    // Format pdf url
    params.printable = /^(blob|http)/i.test(params.printable)
      ? params.printable
      : window.location.origin + (params.printable.charAt(0) !== '/' ? '/' + params.printable : params.printable)

    // Get the file through a http request (Preload)
    let req = new window.XMLHttpRequest()
    req.responseType = 'arraybuffer'

    req.addEventListener('load', () => {
      // Check for errors
      if (req.status !== 200) {
        cleanUp(params)
        params.onError(req.statusText)

        // Since we don't have a pdf document available, we will stop the print job
        return
      }

      // Pass response data to a blob and create a local object url
      let localPdf = new window.Blob([req.response], { type: 'application/pdf' })
      localPdf = window.URL.createObjectURL(localPdf)

      // Pass the url to the printable parameter (replacing the original pdf file url)
      // This will prevent a second request to the file (server) once the iframe loads
      params.printable = localPdf

      send(params, printFrame)
    })

    req.open('GET', params.printable, true)
    req.send()
  }
}

function send (params, printFrame) {
  // Set iframe src with pdf document url
  printFrame.setAttribute('src', params.printable)
  Print.send(params, printFrame)
}
