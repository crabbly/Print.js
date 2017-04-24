import browser from './browser'

let PrintJS = function (params) {
  this.params = params

    // check if showing feedback to user (useful for large files)
  if (this.params.showModal) {
    this.showModal()
  }

    // to prevent duplication and issues, remove this.printFrame from DOM, if it exists
  let usedFrame = document.getElementById(this.params.frameId)

  if (usedFrame) {
    usedFrame.parentNode.removeChild(usedFrame)
  }

    // create a new iframe or embed element (IE prints blank pdf's if we use iframe)
  if (browser.isIE() && this.params.type === 'pdf') {
        // create embed element
    this.printFrame = document.createElement('embed')
    this.printFrame.setAttribute('type', 'application/pdf')

        // hide embed
    this.printFrame.setAttribute('style', 'width:0px;height:0px;')
  } else {
        // create iframe element
    this.printFrame = document.createElement('iframe')

        // hide iframe
    this.printFrame.setAttribute('style', 'display:none;')
  }

    // set element id
  this.printFrame.setAttribute('id', this.params.frameId)

    // for non pdf printing, pass empty html document to srcdoc (force onload callback)
  if (this.params.type !== 'pdf') this.printFrame.srcdoc = '<html><head></head><body></body></html>'
}

export default PrintJS
