import Print from './print';
import { cleanUp } from './functions';
import { PrintJSParams } from './init'; // Assuming PrintJSParams is defined in init.ts

interface PdfModule {
  print: (params: PrintJSParams, printFrame: HTMLIFrameElement) => void;
}

const pdfModule: PdfModule = {
  print: (params: PrintJSParams, printFrame: HTMLIFrameElement): void => {
    // Check if we have base64 data
    if (params.base64) {
      let printable = params.printable as string;
      if (printable.indexOf(',') !== -1) {
        //If pdf base64 start with `data:application/pdf;base64,`,Excute the atob function will throw an error.So we get the content after `,`
        printable = printable.split(',')[1];
      }
      const bytesArray = Uint8Array.from(atob(printable), (c) => c.charCodeAt(0));
      createBlobAndPrint(params, printFrame, bytesArray);
      return;
    }

    // Format pdf url
    let printableUrl = params.printable as string;
    printableUrl = /^(blob|http|\/\/)/i.test(printableUrl)
      ? printableUrl
      : window.location.origin + (printableUrl.charAt(0) !== '/' ? '/' + printableUrl : printableUrl);

    params.printable = printableUrl; // Update params with the formatted URL

    // Get the file through a http request (Preload)
    const req = new window.XMLHttpRequest();
    req.responseType = 'arraybuffer';

    req.addEventListener('error', () => {
      cleanUp(params);
      if (params.onError) {
        params.onError(new Error(req.statusText), req);
      }
      // Since we don't have a pdf document available, we will stop the print job
    });

    req.addEventListener('load', () => {
      // Check for errors
      if ([200, 201].indexOf(req.status) === -1) {
        cleanUp(params);
        if (params.onError) {
          params.onError(new Error(req.statusText), req);
        }
        // Since we don't have a pdf document available, we will stop the print job
        return;
      }

      // Print requested document
      createBlobAndPrint(params, printFrame, req.response);
    });

    req.open('GET', printableUrl, true);
    req.send();
  },
};

export default pdfModule;

function createBlobAndPrint(params: PrintJSParams, printFrame: HTMLIFrameElement, data: ArrayBuffer): void {
  // Pass response or base64 data to a blob and create a local object url
  const localPdf = new window.Blob([data], { type: 'application/pdf' });
  const localPdfUrl = window.URL.createObjectURL(localPdf);

  // Set iframe src with pdf document url
  printFrame.setAttribute('src', localPdfUrl);

  Print.send(params, printFrame);
}
