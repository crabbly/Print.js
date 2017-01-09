// Firefox 1.0+
module.exports = {
  isFirefox () {
    return typeof InstallTrigger !== 'undefined'
  },

  // Internet Explorer 6-11
  isIE () {
    return !!document.documentMode
  }

  // Opera 8.0+
  // let isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0

  // At least Safari 3+: "[object HTMLElementConstructor]"
  // let isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0

  // Edge 20+
  // let isEdge = !isIE && !!window.StyleMedia

  // Chrome 1+
  // let isChrome = !!window.chrome && !!window.chrome.webstore
}
