import browser from './browser'

export default function (PrintJS) {
  PrintJS.prototype.pdf = function () {
        // if showing feedback to user, pre load pdf files (hacky)
        // since we will be using promises, we can't use this feature in IE
    if (this.params.showModal && !browser.isIE()) {
      let pdfObject = document.createElement('img')
      pdfObject.src = this.params.printable

      let pdf = new Promise(function (resolve, reject) {
        let loadPDF = setInterval(checkPDFload, 100)

        function checkPDFload () {
          if (pdfObject.complete) {
            window.clearInterval(loadPDF)
            resolve('PrintJS: PDF loaded. Read to this.')
          }
        }
      })

      let self = this
      pdf.then(function (result) {
                // set iframe src with pdf document url
        self.printFrame.setAttribute('src', self.params.printable)

                // print pdf document
        self.print()
      })
    } else {
            // set iframe src with pdf document url
      this.printFrame.setAttribute('src', this.params.printable)

            // print pdf
      this.print()
    }
  }
}
