declare function printJS(configuration: printJS.Configuration): void;
declare function printJS(source: string, type?: printJS.PrintTypes): void;

declare namespace printJS {
  type PrintTypes = 'pdf' | 'html' | 'image' | 'json' | 'raw-html';

  interface Configuration {
    printable: any;
    fallbackPrintable?: string;
    type?: PrintTypes;
    documentTitle?: string;
    header?: any;
    headerStyle?: string;
    maxWidth?: number;
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
    repeatTableHeader?: boolean;
    css?: string | string[];
    style?: string;
    scanStyles?: boolean;
    onError?: (error: any, xmlHttpRequest?: XMLHttpRequest) => void;
    onPrintDialogClose?: () => void;
    onIncompatibleBrowser?: () => void;
    base64?: boolean;

    // Deprecated
    onPdfOpen?: () => void;
    font?: string;
    font_size?: string;
    honorMarginPadding?: boolean;
    honorColor?: boolean;
    imageStyle?: string;
  }
}

export = printJS;
