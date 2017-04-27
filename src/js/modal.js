const Modal = {
  show (params) {
    // Build modal
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

    // Create wrapper
    let printModal = document.createElement('div')
    printModal.setAttribute('style', modalStyle)
    printModal.setAttribute('id', 'printJS-Modal')

    // Create content div
    let contentDiv = document.createElement('div')
    contentDiv.setAttribute('style', 'display:table-cell; vertical-align:middle; padding-bottom:100px;')

    // Add close button (requires print.css)
    let closeButton = document.createElement('div')
    closeButton.setAttribute('class', 'printClose')
    closeButton.setAttribute('id', 'printClose')
    contentDiv.appendChild(closeButton)

    // Add spinner (requires print.css)
    let spinner = document.createElement('span')
    spinner.setAttribute('class', 'printSpinner')
    contentDiv.appendChild(spinner)

    // Add message
    let messageNode = document.createTextNode(params.modalMessage)
    contentDiv.appendChild(messageNode)

    // Add contentDiv to printModal
    printModal.appendChild(contentDiv)

    // Append print modal element to document body
    document.getElementsByTagName('body')[0].appendChild(printModal)

    // Add event listener to close button
    document.getElementById('printClose').addEventListener('click', function () {
      Modal.close()
    })
  },
  close () {
    let printFrame = document.getElementById('printJS-Modal')

    printFrame.parentNode.removeChild(printFrame)
  }
}

export default Modal
