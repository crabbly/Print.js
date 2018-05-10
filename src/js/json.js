import {
  addWrapper,
  capitalizePrint
} from './functions'
import Print from './print'

export default {
  print: (params, printFrame, isBrowserIE) => {
    // Check if we received proper data
    if (typeof params.printable !== 'object') {
      throw new Error('Invalid javascript data object (JSON).')
    }

    // Check if the repeatTableHeader is boolean
    if (typeof params.repeatTableHeader !== 'boolean') {
      throw new Error('Invalid value for repeatTableHeader attribute (JSON).')
    }

    // Check if properties were provided
    if (!params.properties || typeof params.properties !== 'object') throw new Error('Invalid properties array for your JSON data.')

    // Variable to hold the html string
    let htmlData = ''

    // Check if there is a header on top of the table
    if (params.header) htmlData += '<h1 style="' + params.headerStyle + '">' + params.header + '</h1>'

    // Build html data
    htmlData += jsonToHTML(params)

    // Store html data
    params.htmlData = addWrapper(htmlData, params)

    // Print json data
    Print.send(params, printFrame)
  }
}

function jsonToHTML (params) {
  // Get the row and column data
  let data = params.printable
  let properties = params.properties

  // Create a html table and define the header as repeatable
  let htmlData = '<table style="border-collapse: collapse; width: 100%;">'

  // Check if the header should be repeated
  if (params.repeatTableHeader) {
    htmlData += '<thead>'
  }

  // Create the table row
  htmlData += '<tr>'

  // Create a table header for each column
  for (let a = 0; a < properties.length; a++) {
    htmlData += '<th style="width:' + params.gridHeaderStyle + '%;">' + capitalizePrint(properties[a]) + '</th>'
  }

  // Add the closing tag for the table row
  htmlData += '</tr>'

  // Check if the table header is marked as repeated, then add the closing tag
  if (params.repeatTableHeader) {
    htmlData += '</thead>'
  }

  // Check if the length of the columnSize matches with the properties
  if (params.columnSize.length !== properties.length) {
    console.log('The provided column sizes do not match with the number of expected columns!')
  }

  // Check if the column size is provided as the configuration
  let columnSize = []
  if (params.columnSize.length !== 0) {
    columnSize = params.columnSize
  } else {
    // If the configuration is not provided, then consider the same size for the columns
    for (let n = 0; n < properties.length; n++) {
      columnSize.push(1)
    }
  }

  // Calculate the sum of all flex for the distribution
  const reducer = (accumulator, currentValue) => accumulator + currentValue
  let flexSum = columnSize.reduce(reducer)

  // Add the closing tag for the table body
  htmlData += '<tbody>'

  // Add the table rows
  for (let i = 0; i < data.length; i++) {
    // Add the row starting tag
    htmlData += '<tr>'

    // Print selected properties only
    for (let n = 0; n < properties.length; n++) {
      let stringData = data[i]

      // Support nested objects
      let property = properties[n].split('.')
      if (property.length > 1) {
        for (let p = 0; p < property.length; p++) {
          stringData = stringData[property[p]]
        }
      } else {
        stringData = stringData[properties[n]]
      }

      // Add the row contents and styles
      htmlData += '<td style="word-wrap: break-word; width:' + (columnSize[n] * 100 / flexSum) + '%;' + params.gridStyle + '">' + stringData + '</td>'
    }

    // Add the row ending tag
    htmlData += '</tr>'
  }

  // Add the table closing tag
  htmlData += '</tbody></table>'

  return htmlData
}
