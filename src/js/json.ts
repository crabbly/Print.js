import { capitalizePrint, addHeader, addFooter } from './functions';
import Print from './print';
import { PrintJSParams, PrintJSProperty } from './init';

interface JsonModule {
  print: (params: PrintJSParams, printFrame: HTMLIFrameElement) => void;
}

const jsonModule: JsonModule = {
  print: (params: PrintJSParams, printFrame: HTMLIFrameElement): void => {
    // Check if we received proper data
    if (typeof params.printable !== 'object' || params.printable === null) {
      throw new Error('Invalid javascript data object (JSON).');
    }

    // Validate repeatTableHeader
    if (typeof params.repeatTableHeader !== 'boolean') {
      throw new Error('Invalid value for repeatTableHeader attribute (JSON).');
    }

    // Validate properties
    if (!params.properties || !Array.isArray(params.properties)) {
      throw new Error('Invalid properties array for your JSON data.');
    }

    // We will format the property objects to keep the JSON api compatible with older releases
    params.properties = params.properties.map((property: PrintJSProperty | string) => {
      const defaultColumnSize = 100 / (params.properties as PrintJSProperty[]).length + '%;';
      if (typeof property === 'object' && property !== null) {
        return {
          field: property.field,
          displayName: property.displayName,
          columnSize: property.columnSize ? property.columnSize + ';' : defaultColumnSize,
        };
      }
      return {
        field: property as string,
        displayName: property as string,
        columnSize: defaultColumnSize,
      };
    });

    // Create a print container element
    params.printableElement = document.createElement('div');

    // Check if we are adding a print header
    if (params.header) {
      addHeader(params.printableElement, params);
    }

    // Build the printable html data
    params.printableElement.innerHTML += jsonToHTML(params);

    // Check if we are adding a print footer
    if (params.footer) {
      addFooter(params.printableElement, params);
    }

    // Print the json data
    Print.send(params, printFrame);
  },
};

export default jsonModule;

function jsonToHTML(params: PrintJSParams): string {
  // Get the row and column data
  const data: Record<string, unknown>[] = params.printable as Record<string, unknown>[];
  const properties: PrintJSProperty[] = params.properties as PrintJSProperty[];

  // Create a html table
  let htmlData = '<table style="border-collapse: collapse; width: 100%;">';

  // Check if the header should be repeated
  if (params.repeatTableHeader) {
    htmlData += '<thead>';
  }

  // Add the table header row
  htmlData += '<tr>';

  // Add the table header columns
  for (let a = 0; a < properties.length; a++) {
    htmlData +=
      '<th style="width:' +
      properties[a].columnSize +
      ';' +
      params.gridHeaderStyle +
      '">' +
      capitalizePrint(properties[a].displayName) +
      '</th>';
  }

  // Add the closing tag for the table header row
  htmlData += '</tr>';

  // If the table header is marked as repeated, add the closing tag
  if (params.repeatTableHeader) {
    htmlData += '</thead>';
  }

  // Create the table body
  htmlData += '<tbody>';

  // Add the table data rows
  for (let i = 0; i < data.length; i++) {
    // Add the row starting tag
    htmlData += '<tr>';

    // Print selected properties only
    for (let n = 0; n < properties.length; n++) {
      let stringData: Record<string, unknown> = data[i] as Record<string, unknown>;

      // Support nested objects
      const propertyField = properties[n].field.split('.');
      if (propertyField.length > 1) {
        for (let p = 0; p < propertyField.length; p++) {
          stringData = stringData[propertyField[p]] as Record<string, unknown>;
        }
      } else {
        stringData = stringData[properties[n].field] as Record<string, unknown>;
      }

      // Add the row contents and styles
      htmlData += '<td style="width:' + properties[n].columnSize + params.gridStyle + '">' + stringData + '</td>';
    }

    // Add the row closing tag
    htmlData += '</tr>';
  }

  // Add the table and body closing tags
  htmlData += '</tbody></table>';

  return htmlData;
}
