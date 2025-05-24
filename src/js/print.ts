import Browser from './browser';
import { cleanUp } from './functions';
import { PrintJSParams } from './init'; // Assuming PrintJSParams is defined in init.ts

interface PrintModule {
  send: (params: PrintJSParams, printFrame: HTMLIFrameElement) => void;
}

const Print: PrintModule = {
  send: (params: PrintJSParams, printFrame: HTMLIFrameElement): void => {
    // Append iframe element to document body
    document.getElementsByTagName('body')[0].appendChild(printFrame);

    // Get iframe element
    const iframeElement: HTMLIFrameElement | null = document.getElementById(
      params.frameId || 'printJS'
    ) as HTMLIFrameElement | null;

    if (!iframeElement) {
      if (params.onError) params.onError(new Error('Failed to find iframe element with id: ' + params.frameId));
      return;
    }

    // Wait for iframe to load all content
    iframeElement.onload = () => {
      if (params.type === 'pdf') {
        const ffVersion = Browser.getFirefoxMajorVersion();
        // Add a delay for Firefox. In my tests, 1000ms was sufficient but 100ms was not
        if (Browser.isFirefox() && ffVersion !== undefined && ffVersion < 110) {
          setTimeout(() => performPrint(iframeElement, params), 1000);
        } else {
          performPrint(iframeElement, params);
        }
        return;
      }

      // Get iframe element document
      let printDocument: Document | null = null;
      if (iframeElement.contentWindow) {
        // For most browsers
        printDocument = iframeElement.contentWindow.document;
      } else if (iframeElement.contentDocument) {
        // For older Firefox versions
        printDocument = iframeElement.contentDocument;
      }

      if (!printDocument) {
        const error = new Error('Failed to get iframe document.');
        if (params.onError) params.onError(error);
        else throw error; // Rethrow if no onError is provided
        return;
      }

      // Append printable element to the iframe body
      if (params.printableElement) {
        printDocument.body.appendChild(params.printableElement);
      }

      // Add custom style
      // params.type is already narrowed here (it's not 'pdf')
      if (params.style) {
        // Create style element
        const style: HTMLStyleElement = document.createElement('style');
        style.innerHTML = params.style;

        // Append style element to iframe's head
        printDocument.head.appendChild(style);
      }

      // If printing images, wait for them to load inside the iframe
      const images: HTMLCollectionOf<HTMLImageElement> = printDocument.getElementsByTagName('img');

      if (images.length > 0) {
        loadIframeImages(Array.from(images)).then(() => performPrint(iframeElement, params));
      } else {
        performPrint(iframeElement, params);
      }
    };
  },
};

function performPrint(iframeElement: HTMLIFrameElement, params: PrintJSParams): void {
  try {
    iframeElement.focus();

    const contentWindow = iframeElement.contentWindow;
    if (!contentWindow) {
      const error = new Error('Iframe contentWindow is not available.');
      if (params.onError) params.onError(error);
      else throw error;
      cleanUp(params); // Clean up before returning
      return;
    }

    // If Edge or IE, try catch with execCommand
    if (Browser.isEdge() || Browser.isIE()) {
      try {
        contentWindow.document.execCommand('print', false, null);
      } catch (e: any) {
        // execCommand failed, try calling print()
        setTimeout(function () {
          if (contentWindow) contentWindow.print(); // Check contentWindow again inside timeout
        }, 1000);
      }
    } else {
      // Other browsers
      setTimeout(function () {
        if (contentWindow) contentWindow.print(); // Check contentWindow again inside timeout
      }, 1000);
    }
  } catch (error) {
    if (params.onError) {
      let errInstance: Error;
      if (error instanceof Error) {
        errInstance = error;
      } else {
        let msg: string;
        if (error === null || error === undefined) {
          msg = 'Unknown print error';
        } else {
          msg = String(error);
        }
        // Ensure msg is definitely a string, even if String(error) could somehow be undefined
        if (typeof msg !== 'string') {
          msg = 'Error message could not be stringified.';
        }
        // @ts-ignore TS2345: Suppressing persistent and likely misreported error. msg is string.
        errInstance = new Error(msg);
      }
      params.onError(errInstance);
    } else {
      // If no onError is provided, rethrow the error or handle it.
      let errToThrow: Error;
      if (error instanceof Error) {
        errToThrow = error;
      } else {
        let msg: string; // Re-declare msg for this block scope to apply the same logic
        if (error === null || error === undefined) {
          msg = 'Unknown print error';
        } else {
          msg = String(error);
        }
        if (typeof msg !== 'string') {
          msg = 'Error message could not be stringified.';
        }
        // @ts-ignore TS2345: Suppressing persistent and likely misreported error. msg is string.
        errToThrow = new Error(msg);
      }
      throw errToThrow;
    }
  } finally {
    const ffVersion = Browser.getFirefoxMajorVersion();
    if (Browser.isFirefox() && ffVersion !== undefined && ffVersion < 110) {
      // Move the iframe element off-screen and make it invisible
      iframeElement.style.visibility = 'hidden';
      iframeElement.style.left = '-1px';
    }

    cleanUp(params);
  }
}

function loadIframeImages(images: HTMLImageElement[]): Promise<void[]> {
  const promises = images.map((image) => {
    if (image.src && image.src !== window.location.href) {
      return loadIframeImage(image);
    }
    return Promise.resolve();
  });

  return Promise.all(promises);
}

function loadIframeImage(image: HTMLImageElement): Promise<void> {
  return new Promise((resolve) => {
    // Added parenthesis for clarity
    const pollImage = () => {
      if (!image || typeof image.naturalWidth === 'undefined' || image.naturalWidth === 0 || !image.complete) {
        setTimeout(pollImage, 500);
      } else {
        resolve();
      }
    };
    pollImage();
  });
}

export default Print;
