import Modal from './modal';
import Browser from './browser';
import { PrintJSParams } from './init';

export function addWrapper(htmlData: string, params: PrintJSParams): string {
  const bodyStyle: string =
    'font-family:' + params.font + ' !important; font-size: ' + params.font_size + ' !important; width:100%;';
  return '<div style="' + bodyStyle + '">' + htmlData + '</div>';
}

export function capitalizePrint(obj: string): string {
  return obj.charAt(0).toUpperCase() + obj.slice(1);
}

export function collectStyles(element: HTMLElement, params: PrintJSParams): string {
  const win: Window = document.defaultView || window;

  // String variable to hold styling for each element
  let elementStyle = '';

  // Loop over computed styles
  const styles: CSSStyleDeclaration = win.getComputedStyle(element, '');

  for (let key = 0; key < styles.length; key++) {
    const styleName = styles[key];
    // Check if style should be processed
    let processThisStyle = false;
    if (params.targetStyles) {
      if (Array.isArray(params.targetStyles) && params.targetStyles.indexOf('*') !== -1) {
        processThisStyle = true;
      } else if (Array.isArray(params.targetStyles) && params.targetStyles.indexOf(styleName) !== -1) {
        processThisStyle = true;
      } else if (!Array.isArray(params.targetStyles) && params.targetStyles === '*') {
        processThisStyle = true;
      } else if (!Array.isArray(params.targetStyles) && params.targetStyles === styleName) {
        processThisStyle = true;
      }
    }
    if (!processThisStyle && params.targetStyle) {
      if (Array.isArray(params.targetStyle) && params.targetStyle.indexOf(styleName) !== -1) {
        processThisStyle = true;
      } else if (!Array.isArray(params.targetStyle) && params.targetStyle === styleName) {
        processThisStyle = true;
      }
    }
    if (!processThisStyle && targetStylesMatch(params.targetStyles as string[] | undefined, styleName)) {
      // Cast here, as previous checks handle string case
      processThisStyle = true;
    }

    if (processThisStyle && styles.getPropertyValue(styleName)) {
      elementStyle += styleName + ':' + styles.getPropertyValue(styleName) + ';';
    }
  }

  // Print friendly defaults (deprecated)
  elementStyle += 'max-width: ' + params.maxWidth + 'px !important; font-size: ' + params.font_size + ' !important;';

  return elementStyle;
}

function targetStylesMatch(styles: string[] | undefined, value: string): boolean {
  if (!styles) return false;
  // This function seems to be intended to check if `value` contains any of the `styles` as substrings.
  // The original `typeof value === 'object'` was incorrect as `value` (a css property name) is a string.
  for (let i = 0; i < styles.length; i++) {
    if (value.includes(styles[i])) return true;
  }
  return false;
}

export function addHeader(printElement: HTMLElement, params: PrintJSParams): void {
  // Create the header container div
  const headerContainer: HTMLDivElement = document.createElement('div');

  // Check if the header is text or raw html
  if (params.header && isRawHTML(params.header)) {
    headerContainer.innerHTML = params.header;
  } else if (params.header) {
    // Create header element
    const headerElement: HTMLHeadingElement = document.createElement('h1');

    // Create header text node
    const headerNode: Text = document.createTextNode(params.header);

    // Build and style
    headerElement.appendChild(headerNode);
    if (params.headerStyle) headerElement.setAttribute('style', params.headerStyle);
    headerContainer.appendChild(headerElement);
  }

  printElement.insertBefore(headerContainer, printElement.childNodes[0]);
}

export function addFooter(printElement: HTMLElement, params: PrintJSParams): void {
  // Create the footer container div
  const footerContainer: HTMLDivElement = document.createElement('div');

  // Check if the footer is text or raw html
  if (params.footer && isRawHTML(params.footer)) {
    footerContainer.innerHTML = params.footer;
  } else if (params.footer) {
    // Create footer element
    const footerElement: HTMLHeadingElement = document.createElement('h1');

    // Create footer text node
    const footerNode: Text = document.createTextNode(params.footer);

    // Build and style
    footerElement.appendChild(footerNode);
    if (params.footerStyle) footerElement.setAttribute('style', params.footerStyle);
    footerContainer.appendChild(footerElement);
  }

  printElement.appendChild(footerContainer); // Changed from insertBefore logic that seemed to target lastChild incorrectly
}

export function cleanUp(params: PrintJSParams): void {
  // If we are showing a feedback message to user, remove it
  if (params.showModal && Modal) Modal.close();

  // Check for a finished loading hook function
  if (params.onLoadingEnd) params.onLoadingEnd();

  // If preloading pdf files, clean blob url
  if (
    typeof params.printable === 'string' &&
    params.printable.startsWith('blob:') &&
    (params.showModal || params.onLoadingStart)
  ) {
    window.URL.revokeObjectURL(params.printable);
  }

  // Run onPrintDialogClose callback
  let event = 'mouseover';

  if (Browser.isChrome() || Browser.isFirefox()) {
    // Ps.: Firefox will require an extra click in the document to fire the focus event.
    event = 'focus';
  }

  const handler = (): void => {
    // Make sure the event only happens once.
    window.removeEventListener(event, handler);

    if (params.onPrintDialogClose) params.onPrintDialogClose();

    // Remove iframe from the DOM
    const iframe: HTMLElement | null = document.getElementById(params.frameId || '');

    if (iframe) {
      if (params.frameRemoveDelay) {
        setTimeout(() => {
          iframe.remove();
        }, params.frameRemoveDelay);
      } else {
        iframe.remove();
      }
    }
  };

  window.addEventListener(event, handler);
}

export function isRawHTML(raw: string): boolean {
  const regexHtml = new RegExp('<([A-Za-z][A-Za-z0-9]*)\\b[^>]*>(.*?)</\\1>');
  return regexHtml.test(raw);
}
