import Print from './print'

export default {
  print: (params, printFrame) => {
    // If showing feedback to user, pre load pdf files (hacky)
    if (params.showModal || params.onLoadingStart) {
      let req = new window.XMLHttpRequest()
      req.addEventListener('load', send(params, printFrame))
      req.open('GET', params.printable.indexOf('http') !== -1 ? params.printable : window.location.origin + '/' + params.printable, true)
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
