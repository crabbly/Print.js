import './sass/index.scss';
import printJSModule from './js/init';
import { PrintJSParams } from './js/init'; // Import the interface

const printJS = printJSModule.init;

if (typeof window !== 'undefined') {
  (window as any).printJS = printJS;
}

// Define a type for the printJS function for better clarity
type PrintJSFn = (optionsOrPrintable: PrintJSParams | string, type?: PrintJSParams['type']) => void;

export default printJS as PrintJSFn;
