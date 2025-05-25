import './sass/index.scss';
import printJSModule from './js/init';
import { PrintInitFn } from './js/init';

const printJS: PrintInitFn = printJSModule.init;

// Extend the Window interface to include printJS
declare global {
  interface Window {
    printJS: PrintInitFn;
  }
}

if (typeof window !== 'undefined') {
  (window as Window).printJS = printJS;
}

export default printJS as PrintInitFn;
