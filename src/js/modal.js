export default function (PrintJS) {
  PrintJS.prototype.showModal = function () {
        // build modal
    let modalStyle = 'font-family:sans-serif; ' +
            'display:table; ' +
            'text-align:center; ' +
            'font-weight:300; ' +
            'font-size:30px; ' +
            'left:0; top:0;' +
            'position:fixed; ' +
            'z-index: 9990;' +
            'color: #0460B5; ' +
            'width: 100%; ' +
            'height: 100%; ' +
            'background-color:rgba(255,255,255,.9);' +
            'transition: opacity .3s ease;'

        // create wrapper
    let printModal = document.createElement('div')
    printModal.setAttribute('style', modalStyle)
    printModal.setAttribute('id', 'printJS-Modal')

        // create content div
    let contentDiv = document.createElement('div')
    contentDiv.setAttribute('style', 'display:table-cell; vertical-align:middle; padding-bottom:100px;')

        // add close button (requires this.css)
    let closeButton = document.createElement('div')
    closeButton.setAttribute('class', 'printClose')
    closeButton.setAttribute('id', 'printClose')
    contentDiv.appendChild(closeButton)

        // add spinner (requires this.css)
    let spinner = document.createElement('span')
    spinner.setAttribute('class', 'printSpinner')
    contentDiv.appendChild(spinner)

        // add message
    let messageNode = document.createTextNode(this.params.modalMessage)
    contentDiv.appendChild(messageNode)

        // add contentDiv to printModal
    printModal.appendChild(contentDiv)

        // append print modal element to document body
    document.getElementsByTagName('body')[0].appendChild(printModal)

        // add event listener to close button
    let self = this
    document.getElementById('printClose').addEventListener('click', function () {
      self.disablePrintModal()
    })
  }

  PrintJS.prototype.disablePrintModal = function () {
    let printFrame = document.getElementById('printJS-Modal')

    printFrame.parentNode.removeChild(printFrame)
  }
}
