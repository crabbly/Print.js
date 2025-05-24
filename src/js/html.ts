import { collectStyles, addHeader, addFooter } from './functions';
import Print from './print';
import { PrintJSParams } from './init'; // Assuming PrintJSParams is defined in init.ts

interface HtmlModule {
  print: (params: PrintJSParams, printFrame: HTMLIFrameElement) => void;
}

const htmlModule: HtmlModule = {
  print: (params: PrintJSParams, printFrame: HTMLIFrameElement): void => {
    // Get the DOM printable element
    const printElement: HTMLElement | null = isHtmlElement(params.printable)
      ? (params.printable as HTMLElement)
      : document.getElementById(params.printable as string);

    // Check if the element exists
    if (!printElement) {
      window.console.error('Invalid HTML element id: ' + params.printable);
      return;
    }

    // Clone the target element including its children (if available)
    const clonedElement: Node = cloneElement(printElement, params);

    // The printableElement must be an HTMLElement for addHeader/addFooter
    if (clonedElement.nodeType !== Node.ELEMENT_NODE) {
      window.console.error('Cloned printable element is not an HTMLElement.');
      if (params.onError) params.onError(new Error('Cloned printable element is not an HTMLElement.'));
      return;
    }
    params.printableElement = clonedElement as HTMLElement;

    // Add header
    if (params.header && params.printableElement) {
      addHeader(params.printableElement, params);
    }

    // Add footer
    if (params.footer && params.printableElement) {
      addFooter(params.printableElement, params);
    }

    // Print html element contents
    Print.send(params, printFrame);
  },
};

export default htmlModule;

function cloneElement(element: Node, params: PrintJSParams): Node {
  // Clone the main node
  const clone: Node = element.cloneNode(false); // Pass `false` to not clone children initially

  // Loop over and process the children elements / nodes (including text nodes)
  element.childNodes.forEach((childNode: Node) => {
    // Check if we are skipping the current element
    if (params.ignoreElements) {
      let ignore = false;
      const childHtmlElement = childNode.nodeType === Node.ELEMENT_NODE ? (childNode as HTMLElement) : null;

      if (Array.isArray(params.ignoreElements)) {
        // Check if the id is in a string array of ids, or if the element itself is in an HTMLElement array
        if (
          childHtmlElement &&
          childHtmlElement.id &&
          params.ignoreElements.some((val) => typeof val === 'string' && val === childHtmlElement.id)
        ) {
          ignore = true;
        } else if (
          params.ignoreElements.some(
            (el) => typeof el === 'object' && el !== null && el.isSameNode && el.isSameNode(childNode)
          )
        ) {
          ignore = true;
        }
      } else if (typeof params.ignoreElements === 'string') {
        // Check if the id matches a single string id
        if (childHtmlElement && childHtmlElement.id && params.ignoreElements === childHtmlElement.id) {
          ignore = true;
        }
      }
      if (ignore) return; // equivalent to continue
    }

    // Clone the child element recursively
    const clonedChild: Node = cloneElement(childNode, params);

    // Attach the cloned child to the cloned parent node
    clone.appendChild(clonedChild);
  });

  // Get all styling for print element (for nodes of type element only)
  if (params.scanStyles && element.nodeType === Node.ELEMENT_NODE) {
    (clone as HTMLElement).setAttribute('style', collectStyles(element as HTMLElement, params));
  }

  // Check if the element needs any state processing (copy user input data)
  if (element.nodeType === 1) {
    const htmlElement = element as HTMLElement;
    const clonedHtmlElement = clone as HTMLElement;
    switch (htmlElement.tagName) {
      case 'SELECT':
        // Copy the current selection value to its clone
        (clonedHtmlElement as HTMLSelectElement).value = (htmlElement as HTMLSelectElement).value;
        break;
      case 'CANVAS':
        // Copy the canvas content to its clone
        const context = (clonedHtmlElement as HTMLCanvasElement).getContext('2d');
        if (context) {
          context.drawImage(htmlElement as HTMLCanvasElement, 0, 0);
        }
        break;
    }
  }

  return clone;
}

function isHtmlElement(printable: any): printable is HTMLElement {
  // Check if element is instance of HTMLElement or has nodeType === 1 (for elements in iframe)
  return (
    typeof printable === 'object' &&
    printable !== null &&
    (printable instanceof HTMLElement || printable.nodeType === Node.ELEMENT_NODE)
  );
}
