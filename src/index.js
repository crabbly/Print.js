import './sass/index.scss'
import print from './js/init'

const printJS = print.init

if (typeof window !== 'undefined') {
  window.printJS = printJS
}

export default printJS
