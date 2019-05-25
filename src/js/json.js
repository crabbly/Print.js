import { capitalizePrint, addHeader } from './functions'
import Print from './print'

export default {
  print: (params, printFrame) => {
    // Check if we received proper data
    if (typeof params.printable !== 'object') {
      throw new Error('Invalid javascript data object (JSON).')
    }

    // Validate repeatTableHeader
    if (typeof params.repeatTableHeader !== 'boolean') {
      throw new Error('Invalid value for repeatTableHeader attribute (JSON).')
    }

    // Validate properties
    if (!params.properties || !Array.isArray(params.properties)) {
      throw new Error('Invalid properties array for your JSON data.')
    }

    // We will format the property objects to keep the JSON api compatible with older releases
    params.properties = params.properties.map(property => {
      return {
        field: typeof property === 'object' ? property.field : property,
        displayName: typeof property === 'object' ? property.displayName : property,
        columnSize: typeof property === 'object' && property.columnSize ? property.columnSize + ';' : 100 / params.properties.length + '%;'
      }
    })

    // Create a print container element
    params.printableElement = document.createElement('div')

    // Check if we are adding a print header
    if (params.header) {
      addHeader(params.printableElement, params)
    }

    // Build the printable html data
    params.printableElement.innerHTML += jsonToHTML(params)

    // Print the json data
    Print.send(params, printFrame)
  }
}

function jsonToHTML (params) {
  // Get the row and column data
  let data = params.printable
  let properties = params.properties

  // Create a html table
  let htmlData = '<table style="border-collapse: collapse; width: 100%;">'

  // Check if the header should be repeated
  if (params.repeatTableHeader) {
    htmlData += '<thead>'
  }

  // Add the table header row
  htmlData += '<tr>'

  // Add the table header columns
  for (let a = 0; a < properties.length; a++) {
    htmlData += '<th style="width:' + properties[a].columnSize + ';' + params.gridHeaderStyle + '">' + capitalizePrint(properties[a].displayName) + '</th>'
  }

  // Add the closing tag for the table header row
  htmlData += '</tr>'

  // If the table header is marked as repeated, add the closing tag
  if (params.repeatTableHeader) {
    htmlData += '</thead>'
  }

  // Create the table body
  htmlData += '<tbody>'

  // Add the table data rows
  for (let i = 0; i < data.length; i++) {
    // Add the row starting tag
    htmlData += '<tr>'

    // Print selected properties only
    for (let n = 0; n < properties.length; n++) {
      let stringData = data[i]

      // Support nested objects
      let property = properties[n].field.split('.')
      if (property.length > 1) {
        for (let p = 0; p < property.length; p++) {
          stringData = stringData[property[p]]
        }
      } else {
        stringData = stringData[properties[n].field]
      }

      // Add the row contents and styles
      htmlData += '<td style="width:' + properties[n].columnSize + params.gridStyle + '">' + stringData + '</td>'
    }

    // Add the row closing tag
    htmlData += '</tr>'
  }

  // Add the table and body closing tags
  htmlData += '</tbody></table>'

  return htmlData
}
