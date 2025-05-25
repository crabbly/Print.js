interface BrowserInterface {
  isFirefox: () => boolean;
  getFirefoxMajorVersion: (userAgent?: string) => number | undefined;
  isIE: () => boolean;
  isEdge: () => boolean;
  isChrome: (context?: Window & { chrome?: unknown }) => boolean;
  isSafari: () => boolean;
  isIOSChrome: () => boolean;
}

const Browser: BrowserInterface = {
  // Firefox 1.0+
  isFirefox: (): boolean => {
    return typeof (window as Window & { InstallTrigger?: unknown }).InstallTrigger !== 'undefined';
  },
  getFirefoxMajorVersion: (userAgent?: string): number | undefined => {
    userAgent = userAgent || navigator.userAgent;
    const firefoxVersionRegex = /firefox\/(\S+)/;
    const match: RegExpMatchArray | null = userAgent.toLowerCase().match(firefoxVersionRegex);
    if (match) {
      return match[1].split('.').map((x: string) => parseInt(x))[0];
    }
  },
  // Internet Explorer 6-11
  isIE: (): boolean => {
    return (
      navigator.userAgent.indexOf('MSIE') !== -1 || !!(document as Document & { documentMode?: unknown }).documentMode
    );
  },
  // Edge 20+
  isEdge: (): boolean => {
    return !Browser.isIE() && !!(window as Window & { StyleMedia?: unknown }).StyleMedia;
  },
  // Chrome 1+
  isChrome: (context: Window & { chrome?: unknown } = window): boolean => {
    return !!context.chrome;
  },
  // At least Safari 3+: "[object HTMLElementConstructor]"
  isSafari: (): boolean => {
    return (
      Object.prototype.toString
        .call((window as Window & { HTMLElement?: { name: string } }).HTMLElement)
        .indexOf('Constructor') > 0 || navigator.userAgent.toLowerCase().indexOf('safari') !== -1
    );
  },
  // IOS Chrome
  isIOSChrome: (): boolean => {
    return navigator.userAgent.toLowerCase().indexOf('crios') !== -1;
  },
};

export default Browser;
