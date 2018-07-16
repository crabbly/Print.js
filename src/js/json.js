import {
  addWrapper,
  capitalizePrint
} from './functions'
import Print from './print'

export default {
  print: (params, printFrame) => {
    // If both single and multiple tables are requested at the same time, throw an error
    if (params.printable && params.multiplePrintable) throw new Error('Only one printable type (single or multiple) can be processed at the same time.')

    // In case of single table, check if the data structure is correct
    if (params.printable && typeof params.printable !== 'object') throw new Error('Invalid javascript data object (JSON) for single table.')

    // Check if properties were provided
    if (params.printable && (!params.properties || !Array.isArray(params.properties))) throw new Error('Invalid properties array for your JSON data.')

    // In case of multiple table, check if the data structure is correct
    if (params.multiplePrintable && typeof params.multiplePrintable !== 'object') throw new Error('Invalid javascript data object (JSON) for multiple table.')

    // Check if the repeatTableHeader is boolean
    if (typeof params.repeatTableHeader !== 'boolean') throw new Error('Invalid value for repeatTableHeader attribute (JSON).')

    // Variable to hold the html string
    let htmlData = ''

    // Check if there is a header on top of the table
    if (params.header) htmlData += '<h1 style="' + params.headerStyle + '">' + params.header + '</h1>'

    // Build the printable html data
    htmlData += jsonToHTML(params)

    // Store the data
    params.htmlData = addWrapper(htmlData, params)

    // Print the json data
    Print.send(params, printFrame)
  }
}

function jsonToHTML (params) {
  // Define an empty holder for the htmldata
  let htmlData = ''

  // Check if the print is supposed to be with multiple tables
  if (params.multiplePrintable === null) {
    // Create an array of objects for the single table
    let dataset = [{
      // headerName: params.headerName,
      properties: params.properties,
      printable: params.printable
    }]

    // Pass the dataset to the html table creater
    htmlData = createHtmlTable(params, dataset)
  } else {
    htmlData += createHtmlTable(params, params.multiplePrintable)
  }
  return htmlData
}

/**
 * Function to create the html table(s).
 * @param  {object} params parameters list which needs to be considered while generating the table.
 * @param  {array} dataset the array containing the dataset which needs to be converted to a table.
 */
function createHtmlTable (params, dataset) {
  // Defining the htmlTable holder
  let htmlData = ''

  // Loop through the multiple printable
  for (let idx in dataset) {
    // Retrieve the object from the array
    let tableObj = dataset[idx]

    // Get the row and column data
    let data = tableObj.printable
    let properties = tableObj.properties

    // Create a html table
    htmlData += '<br><table style="border-collapse: collapse; width: 100%;">'

    // Check if the header should be repeated
    if (params.repeatTableHeader) {
      htmlData += '<thead>'
    }

    // Add the table header row
    htmlData += '<tr>'

    // Add the table header columns
    for (let a = 0; a < properties.length; a++) {
      htmlData += '<th style="width:' + (properties[a].columnSize * 100) + '%; ' + params.gridHeaderStyle + '">' + capitalizePrint(properties[a].displayName) + '</th>'
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
        htmlData += '<td style="width:' + (properties[n].columnSize * 100) + '%;' + params.gridStyle + '">' + stringData + '</td>'
      }

      // Add the row closing tag
      htmlData += '</tr>'
    }

    // Add the table and body closing tags
    htmlData += '</tbody></table>'
  }

  // Return the table
  return htmlData
}
