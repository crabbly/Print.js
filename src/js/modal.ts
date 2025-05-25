import { PrintJSParams } from './init';

interface ModalInterface {
  show: (params: PrintJSParams) => void;
  close: () => void;
}

const Modal: ModalInterface = {
  show(params: PrintJSParams): void {
    // Build modal
    const modalStyle: string =
      'font-family:sans-serif; ' +
      'display:table; ' +
      'text-align:center; ' +
      'font-weight:300; ' +
      'font-size:30px; ' +
      'left:0; top:0;' +
      'position:fixed; ' +
      'z-index: 9990;' +
      'color: #0460B5; ' +
      'width: 100%; ' +
      'height: 100%; ' +
      'background-color:rgba(255,255,255,.9);' +
      'transition: opacity .3s ease;';

    // Create wrapper
    const printModal: HTMLDivElement = document.createElement('div');
    printModal.setAttribute('style', modalStyle);
    printModal.setAttribute('id', 'printJS-Modal');

    // Create content div
    const contentDiv: HTMLDivElement = document.createElement('div');
    contentDiv.setAttribute('style', 'display:table-cell; vertical-align:middle; padding-bottom:100px;');

    // Add close button (requires print.css)
    const closeButton: HTMLDivElement = document.createElement('div');
    closeButton.setAttribute('class', 'printClose');
    closeButton.setAttribute('id', 'printClose');
    contentDiv.appendChild(closeButton);

    // Add spinner (requires print.css)
    const spinner: HTMLSpanElement = document.createElement('span');
    spinner.setAttribute('class', 'printSpinner');
    contentDiv.appendChild(spinner);

    // Add message
    const messageNode: Text = document.createTextNode(params.modalMessage || 'Retrieving Document...');
    contentDiv.appendChild(messageNode);

    // Add contentDiv to printModal
    printModal.appendChild(contentDiv);

    // Append print modal element to document body
    document.getElementsByTagName('body')[0].appendChild(printModal);

    // Add event listener to close button
    const closeButtonElement = document.getElementById('printClose');
    if (closeButtonElement) {
      closeButtonElement.addEventListener('click', function () {
        Modal.close();
      });
    }
  },
  close(): void {
    const printModal: HTMLElement | null = document.getElementById('printJS-Modal');

    if (printModal && printModal.parentNode) {
      printModal.parentNode.removeChild(printModal);
    }
  },
};

export default Modal;
