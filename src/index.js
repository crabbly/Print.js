import print from './js/init'

const printjs = print.init

if (typeof window !== 'undefined') {
  window.printJS = printjs
}

export default printjs
