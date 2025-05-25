import Print from './print';
import { addHeader, addFooter } from './functions';
import { PrintJSParams } from './init';

interface RawHtmlModule {
  print: (params: PrintJSParams, printFrame: HTMLIFrameElement) => void;
}

const rawHtmlModule: RawHtmlModule = {
  print: (params: PrintJSParams, printFrame: HTMLIFrameElement): void => {
    // Create printable element (container)
    const printableElement = document.createElement('div');
    printableElement.setAttribute('style', 'width:100%');

    // Set our raw html as the printable element inner html content
    printableElement.innerHTML = params.printable as string;
    params.printableElement = printableElement;

    // Add header
    if (params.header) {
      addHeader(params.printableElement, params);
    }

    // Add footer
    if (params.footer) {
      addFooter(params.printableElement, params);
    }

    // Print html contents
    Print.send(params, printFrame);
  },
};

export default rawHtmlModule;
