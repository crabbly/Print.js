import { addHeader, addFooter } from './functions';
import Print from './print';
import Browser from './browser';
import { PrintJSParams } from './init';

interface ImageModule {
  print: (params: PrintJSParams, printFrame: HTMLIFrameElement) => void;
}

const imageModule: ImageModule = {
  print: (params: PrintJSParams, printFrame: HTMLIFrameElement): void => {
    // Check if we are printing one image or multiple images
    let printableImages: string[];
    if (!Array.isArray(params.printable)) {
      printableImages = [params.printable as string];
    } else {
      printableImages = params.printable as string[];
    }
    params.printable = printableImages; // Update params.printable to be consistently an array for this scope

    // Create printable element (container)
    const printableElementContainer: HTMLDivElement = document.createElement('div');
    params.printableElement = printableElementContainer; // Assign to params for other functions

    // Create all image elements and append them to the printable container
    printableImages.forEach((src: string) => {
      // Create the image element
      const img: HTMLImageElement = document.createElement('img');
      if (params.imageStyle) img.setAttribute('style', params.imageStyle);

      // Set image src with the file url
      img.src = src;

      // The following block is for Firefox, which for some reason requires the image's src to be fully qualified in
      // order to print it
      if (Browser.isFirefox()) {
        const fullyQualifiedSrc: string = img.src;
        img.src = fullyQualifiedSrc;
      }

      // Create the image wrapper
      const imageWrapper: HTMLDivElement = document.createElement('div');

      // Append image to the wrapper element
      imageWrapper.appendChild(img);

      // Append wrapper to the printable element
      printableElementContainer.appendChild(imageWrapper);
    });

    // Check if we are adding a print header
    if (params.header) addHeader(printableElementContainer, params);

    // Check if we are adding a print footer
    if (params.footer) {
      addFooter(printableElementContainer, params);
    }

    // Print image
    Print.send(params, printFrame);
  },
};

export default imageModule;
