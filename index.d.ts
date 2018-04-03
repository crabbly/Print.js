import 'print-js/dist/print';

declare type PrintTypes = 'pdf' | 'html' | 'image' | 'json';

export interface Configuration {
    printable: string;
    type?: string;
    documentTitle?: string;
    htmlData?: string;
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
    gridStyle?: string;
    modalMessage?: string;
    showModal?: boolean;
    gridHeaderStyle?: string;
    onLoadingStart?: () => void;
    onLoadingEnd?: () => void;
}

declare var printJS: (params: string | Configuration) => void;

export default printJS;
