import { addWrapper } from './functions'
import Print from './print'

export default {
  print: (params, printFrame) => {
    // Store html data
    params.htmlData = addWrapper(params.printable, params)

    // Print html contents
    Print.send(params, printFrame)
  }
}
