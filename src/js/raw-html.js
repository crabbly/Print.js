import Print from './print'

export default {
  print: (params, printFrame) => {
    // Create printable element (container)
    params.printableElement = document.createElement('div')
    params.printableElement.setAttribute('style', 'width:100%')

    // Set our raw html as the printable element inner html content
    params.printableElement.innerHTML = params.printable

    // Print html contents
    Print.send(params, printFrame)
  }
}
