import Browser from './browser';
import Modal from './modal';
import Pdf from './pdf';
import Html from './html';
import RawHtml from './raw-html';
import Image from './image';
import Json from './json';

const printTypes: string[] = ['pdf', 'html', 'image', 'json', 'raw-html'];

export interface PrintJSProperty {
  field: string;
  displayName: string;
  columnSize?: string;
}

export interface PrintJSParams {
  printable: string | string[] | HTMLElement | any[] | null; // any[] for json type
  fallbackPrintable?: string | null; // Allow null in case user explicitly passes it
  type?: 'pdf' | 'html' | 'image' | 'json' | 'raw-html';
  header?: string | null;
  headerStyle?: string | null;
  footer?: string | null;
  footerStyle?: string | null;
  maxWidth?: number;
  properties?: PrintJSProperty[] | null;
  gridHeaderStyle?: string | null;
  gridStyle?: string | null;
  showModal?: boolean;
  onError?: (error: Error, xmlHttpRequest?: XMLHttpRequest) => void;
  onLoadingStart?: (() => void) | null;
  onLoadingEnd?: (() => void) | null;
  onPrintDialogClose?: () => void;
  onIncompatibleBrowser?: () => void;
  modalMessage?: string | null;
  frameId?: string | null;
  frameRemoveDelay?: number | null;
  printableElement?: HTMLElement | null;
  documentTitle?: string | null;
  targetStyle?: string | string[] | null;
  targetStyles?: string | string[] | null;
  ignoreElements?: string | string[] | HTMLElement[];
  repeatTableHeader?: boolean;
  css?: string | string[] | null;
  style?: string | null;
  scanStyles?: boolean;
  base64?: boolean;

  // Deprecated
  onPdfOpen?: (() => void) | null;
  font?: string | null;
  font_size?: string | null;
  honorMarginPadding?: boolean;
  honorColor?: boolean;
  imageStyle?: string | null;
}

export type PrintInitFn = (optionsOrPrintable: PrintJSParams | string, type?: PrintJSParams['type']) => void;

interface PrintJS {
  init: PrintInitFn;
}

const printJS: PrintJS = {
  init: (optionsOrPrintable: PrintJSParams | string, type?: PrintJSParams['type']): void => {
    const params: PrintJSParams = {
      printable: null,
      fallbackPrintable: null,
      type: 'pdf',
      header: null,
      headerStyle: 'font-weight: 300;',
      footer: null,
      footerStyle: 'font-weight: 300;',
      maxWidth: 800,
      properties: null,
      gridHeaderStyle: 'font-weight: bold; padding: 5px; border: 1px solid #dddddd;',
      gridStyle: 'border: 1px solid lightgray; margin-bottom: -1px;',
      showModal: false,
      onError: (error: Error) => {
        throw error;
      },
      onLoadingStart: null,
      onLoadingEnd: null,
      onPrintDialogClose: () => {},
      onIncompatibleBrowser: () => {},
      modalMessage: 'Retrieving Document...',
      frameId: 'printJS',
      frameRemoveDelay: null,
      printableElement: null,
      documentTitle: 'Document',
      targetStyle: ['clear', 'display', 'width', 'min-width', 'height', 'min-height', 'max-height'],
      targetStyles: ['border', 'box', 'break', 'text-decoration'],
      ignoreElements: [],
      repeatTableHeader: true,
      css: null,
      style: null,
      scanStyles: true,
      base64: false,

      // Deprecated
      onPdfOpen: null,
      font: 'TimesNewRoman',
      font_size: '12pt',
      honorMarginPadding: true,
      honorColor: false,
      imageStyle: 'max-width: 100%;',
    };

    // Check if a printable document or object was supplied
    if (optionsOrPrintable === undefined) {
      throw new Error('printJS expects at least 1 attribute.');
    }

    // Process parameters
    switch (typeof optionsOrPrintable) {
      case 'string':
        // Printable is a string (URL or base64 data)
        // We should only encode URI if it's not base64 data
        if (optionsOrPrintable.startsWith('data:')) {
          params.printable = optionsOrPrintable;
        } else {
          params.printable = encodeURI(optionsOrPrintable);
        }
        params.fallbackPrintable = params.printable;
        if (type) params.type = type;
        break;
      case 'object':
        const options = optionsOrPrintable as PrintJSParams; // optionsOrPrintable is an object
        params.printable = options.printable;
        params.type = options.type || params.type; // Ensure type is taken from options if available

        // Assign fallbackPrintable: if options.fallbackPrintable is provided, use it. Otherwise, if options.printable is a string, use that. Else, undefined.
        if (typeof options.fallbackPrintable !== 'undefined') {
          params.fallbackPrintable = options.fallbackPrintable;
        } else if (typeof options.printable === 'string') {
          params.fallbackPrintable = options.printable;
        } else {
          params.fallbackPrintable = undefined; // Explicitly set to undefined if not applicable
        }

        // Handle base64 for fallbackPrintable (if it's a string)
        if (options.base64 && typeof params.fallbackPrintable === 'string') {
          if (!params.fallbackPrintable.startsWith('data:application/pdf;base64,')) {
            params.fallbackPrintable = `data:application/pdf;base64,${params.fallbackPrintable}`;
          }
        }

        // Iterate over options provided and assign them to params
        for (const key in options) {
          if (options.hasOwnProperty(key)) {
            const paramKey = key as keyof PrintJSParams;
            if (paramKey === 'printable' || paramKey === 'fallbackPrintable' || paramKey === 'type') {
              continue; // Already handled
            }
            if (params.hasOwnProperty(paramKey) && options[paramKey] !== undefined) {
              (params as Record<string, any>)[paramKey] = options[paramKey];
            }
          }
        }
        break;
      default:
        throw new Error('Unexpected argument type! Expected "string" or "object", got ' + typeof optionsOrPrintable);
    }

    // Validate printable
    if (!params.printable) throw new Error('Missing printable information.');

    // Validate type
    if (!params.type || typeof params.type !== 'string' || printTypes.indexOf(params.type.toLowerCase()) === -1) {
      throw new Error('Invalid print type. Available types are: pdf, html, image and json.');
    }

    // Check if we are showing a feedback message to the user (useful for large files)
    if (params.showModal && Modal) Modal.show(params);

    // Check for a print start hook function
    if (params.onLoadingStart) params.onLoadingStart();

    // To prevent duplication and issues, remove any used printFrame from the DOM
    const usedFrame: HTMLElement | null = document.getElementById(params.frameId || 'printJS');

    if (usedFrame) usedFrame.parentNode?.removeChild(usedFrame);

    // Create a new iframe for the print job
    const printFrame: HTMLIFrameElement = document.createElement('iframe');

    if (Browser.isFirefox()) {
      // Set the iframe to be is visible on the page (guaranteed by fixed position) but hidden using opacity 0, because
      // this works in Firefox. The height needs to be sufficient for some part of the document other than the PDF
      // viewer's toolbar to be visible in the page
      printFrame.setAttribute(
        'style',
        'width: 1px; height: 100px; position: fixed; left: 0; top: 0; opacity: 0; border-width: 0; margin: 0; padding: 0'
      );
    } else {
      // Hide the iframe in other browsers
      printFrame.setAttribute('style', 'visibility: hidden; height: 0; width: 0; position: absolute; border: 0');
    }

    // Set iframe element id
    printFrame.setAttribute('id', params.frameId || 'printJS');

    // For non pdf printing, pass an html document string to srcdoc (force onload callback)
    if (params.type !== 'pdf') {
      printFrame.srcdoc = '<html><head><title>' + params.documentTitle + '</title>';

      // Attach css files
      if (params.css) {
        // Add support for single file
        if (!Array.isArray(params.css)) params.css = [params.css];

        // Create link tags for each css file
        params.css.forEach((file: string) => {
          printFrame.srcdoc += '<link rel="stylesheet" href="' + file + '">';
        });
      }

      printFrame.srcdoc += '</head><body></body></html>';
    }

    // Check printable type
    switch (params.type) {
      case 'pdf':
        // Check browser support for pdf and if not supported we will just open the pdf file instead
        if (Browser.isIE()) {
          try {
            console.info("Print.js doesn't support PDF printing in Internet Explorer.");
            const win = window.open(params.fallbackPrintable || '', '_blank');
            if (win) win.focus();
            if (params.onIncompatibleBrowser) params.onIncompatibleBrowser();
          } catch (error: any) {
            if (params.onError) params.onError(error);
          } finally {
            // Make sure there is no loading modal opened
            if (params.showModal && Modal) Modal.close();
            if (params.onLoadingEnd) params.onLoadingEnd();
          }
        } else {
          Pdf.print(params, printFrame);
        }
        break;
      case 'image':
        Image.print(params, printFrame);
        break;
      case 'html':
        Html.print(params, printFrame);
        break;
      case 'raw-html':
        RawHtml.print(params, printFrame);
        break;
      case 'json':
        Json.print(params, printFrame);
        break;
    }
  },
};

export default printJS;
