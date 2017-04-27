import print from './js/init'

const printjs = print.init

if (typeof window !== 'undefined') {
  window.printjs = printjs
}

export default printjs
