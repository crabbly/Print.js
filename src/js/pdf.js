import Print from './print'

export default {
  print: (params, printFrame) => {
    // Format pdf url
    params.printable = /^(blob|http)/i.test(params.printable)
      ? params.printable
      : window.location.origin + (params.printable.charAt(0) !== '/' ? '/' + params.printable : params.printable)

    // If showing a loading modal or using a hook function, we will preload the pdf file
    if (params.showModal || params.onLoadingStart) {
      // Get the file through a http request
      let req = new window.XMLHttpRequest()
      req.responseType = 'arraybuffer'

      req.addEventListener('load', () => {
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
    } else {
      send(params, printFrame)
    }
  }
}

function send (params, printFrame) {
  // Set iframe src with pdf document url
  printFrame.setAttribute('src', params.printable)
  Print.send(params, printFrame)
}
