import {
  addWrapper,
  capitalizePrint
} from './functions';
import Print from './print';

export default {
  print: (params, printFrame) => {

    // Check if we received proper data
    if (typeof params.printable !== 'object') {
      throw new Error('Invalid javascript data object (JSON).');
    }

    // Check if properties were provided
    if (!params.properties || typeof params.properties !== 'object') {
      throw new Error('Invalid properties array for your JSON data.');
    }

    // Variable to hold the html string
    let htmlData = ''

    // Check print has header
    if (params.header) {
      htmlData += '<h1 style="' + params.headerStyle + '">' + params.header + '</h1>';
    }

    // Build html data
    htmlData += jsonToHTML(params);

    // Store html data
    params.htmlData = addWrapper(htmlData, params);

    // Print json data
    Print.send(params, printFrame);
  }
}

function jsonToHTML(params) {
  let data = params.printable;
  let properties = params.properties;

  // Defining the report header as repeatable
  let htmlData = '<table style="border-collapse: collapse; width: 100%;"><thead><tr>';
  for (let a = 0; a < properties.length; a++) {
    htmlData += '<th style="width:' + 100 / properties.length + '%; ' + params.gridHeaderStyle + '">' + capitalizePrint(properties[a]) + '</th>';
  }
  htmlData += '</tr></thead><tbody>';

  // Adding the table rows
  for (let i = 0; i < data.length; i++) {

    // Adding the starting tag
    htmlData += '<tr>';

    // Print selected properties only
    for (let n = 0; n < properties.length; n++) {
      let stringData = data[i];

      // Adding the support for the nested objects
      let property = properties[n].split('.');
      if (property.length > 1) {
        for (let p = 0; p < property.length; p++) {
          stringData = stringData[property[p]];
        }
      } else {
        stringData = stringData[properties[n]];
      }

      // Adding the row contents and styles
      htmlData += '<td style="width:' + 100 / properties.length + '%;' + params.gridStyle + '">' + stringData + '</td>';
    }

    // Adding the ending tag
    htmlData += '</tr>';
  }

  // Adding the closing tag of the table
  htmlData += '</tbody></table>';

  // Return the structure back to the printer
  return htmlData;
}