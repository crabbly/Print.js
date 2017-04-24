import { addWrapper, capitalizePrint } from './functions'

export default function (PrintJS) {
  PrintJS.prototype.json = function () {
        // check if we received proper data
    if (typeof this.params.printable !== 'object') {
      throw new Error('Invalid javascript data object (JSON).')
    }

        // Check if properties were provided
    if (!this.params.properties || typeof this.params.properties !== 'object') {
      throw new Error('Invalid properties array for your JSON data.')
    }

        // Variable to hold html string
    let htmlData = ''

        // Check print has header
    if (this.params.header) {
      htmlData += '<h1 style="font-weight:300;">' + this.params.header + '</h1>'
    }

        // Function to build html templates for json data
    htmlData += this.jsonToHTML()

        // Store html data
    this.params.htmlData = addWrapper(htmlData, this.params)

        // Print json data
    this.print()
  }

  PrintJS.prototype.jsonToHTML = function () {
    let data = this.params.printable
    let properties = this.params.properties

    let htmlData = '<div style="display:flex; flex-direction: column;">'

        // Header
    htmlData += '<div style="flex:1; display:flex;">'

    for (let a = 0; a < properties.length; a++) {
      htmlData += '<div style="flex:1; padding:5px;">' + capitalizePrint(properties[a]['displayName'] || properties[a]) + '</div>'
    }

    htmlData += '</div>'

        // Create html data
    for (let i = 0; i < data.length; i++) {
      htmlData += '<div style="flex:1; display:flex;'
      htmlData += this.params.border ? 'border:1px solid lightgray;' : ''
      htmlData += '">'

      for (let n = 0; n < properties.length; n++) {
        htmlData += '<div style="flex:1; padding:5px;">' + data[i][properties[n]['field'] || properties[n]] + '</div>'
      }

      htmlData += '</div>'
    }

    htmlData += '</div>'

    return htmlData
  }
}
