'use strict';

// Firefox 1.0+
module.exports = {
  isFirefox: function isFirefox() {
    return typeof InstallTrigger !== 'undefined';
  },

  // Internet Explorer 6-11
  isIE: function isIE() {
    return !!document.documentMode;
  },

  // Edge 20+
  isEdge: function isEdge() {
    return !this.isIE() && !!window.StyleMedia;
  },

  // Chrome 1+
  isChrome: function isChrome() {
    return !!window.chrome && !!window.chrome.webstore;
  }

  // Opera 8.0+
  // let isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0

  // At least Safari 3+: "[object HTMLElementConstructor]"
  // let isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0
};