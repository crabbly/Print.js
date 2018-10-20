declare type PrintTypes = 'pdf' | 'html' | 'image' | 'json';

export interface Configuration {
  printable: any;
  fallbackPrintable?: string;
  type?: PrintTypes;
  documentTitle?: string;
  header?: any;
  headerStyle?: string;
  maxWidth?: number;
  font?: string;
  font_size?: string;
  honorMarginPadding?: boolean;
  honorColor?: boolean;
  targetStyle?: string | string[];
  targetStyles?: string | string[];
  properties?: any;
  gridHeaderStyle?: string;
  gridStyle?: string;
  showModal?: boolean;
  onLoadingStart?: () => void;
  onLoadingEnd?: () => void;
  modalMessage?: string;
  frameId?: string;
  ignoreElements?: string | string[];
  imageStyle?: string;
  repeatTableHeader?: boolean;
  css?: string | string[];
  style?: string;
  scanStyles?: boolean;
  onError?: (error: any) => void;
  onPrintDialogClose?: () => void;
  onPdfOpen?: () => void;
}

declare var printJS: (params: string | Configuration) => void;

export default printJS;
