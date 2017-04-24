import browser from './browser'

export default function (PrintJS) {
  PrintJS.prototype.print = function () {
    let self = this

        // append iframe element to document body
    document.getElementsByTagName('body')[0].appendChild(this.printFrame)

        // get iframe element
    let printJS = document.getElementById(this.params.frameId)

        // if printing pdf in IE
    if (browser.isIE() && this.params.type === 'pdf') {
      finishPrintPdfIe()
    } else {
            // wait for iframe to load all content
      this.printFrame.onload = function () {
        if (self.params.type === 'pdf') {
          finishPrint()
        } else {
                    // get iframe element document
          let printDocument = (printJS.contentWindow || printJS.contentDocument)
          if (printDocument.document) printDocument = printDocument.document

                    // inject printable html into iframe body
          printDocument.body.innerHTML = self.params.htmlData

                    // wait for image to load inside iframe (chrome only)
          if (self.params.type === 'image' && browser.isChrome()) {
            printDocument.getElementById('printableImage').onload = function () {
              finishPrint()
            }
          } else {
            finishPrint()
          }
        }
      }
    }

    function finishPrint () {
            // print iframe document
      printJS.focus()

            // if IE or Edge, try catch with execCommand
      if (browser.isIE() || browser.isEdge()) {
        try {
          printJS.contentWindow.document.execCommand('print', false, null)
        } catch (e) {
          printJS.contentWindow.print()
        }
      } else {
        printJS.contentWindow.print()
      }

            // if showing feedback to user, close modal (printing / processing message)
      if (self.params.showModal) {
        self.disablePrintModal()
      }
    }

    function finishPrintPdfIe () {
            // wait until pdf is ready to print
      if (typeof printJS.print === 'undefined') {
        setTimeout(function () { finishPrintPdfIe() }, 1000)
      } else {
        printJS.print()

                // remove embed (just because it isn't 100% hidden when using h/w = 0)
        setTimeout(function () { printJS.parentNode.removeChild(printJS) }, 2000)
      }
    }
  }
}
