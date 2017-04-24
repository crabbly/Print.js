/*
 * Print.js
 * http://printjs.crabbly.com
 * Version: 1.0.16
 *
 * Copyright 2017 Rodrigo Vieira (@crabbly)
 * Released under the MIT license
 * https://github.com/crabbly/Print.js/blob/master/LICENSE
 */

import printJS from './js/init'

export default printJS

if (typeof window !== 'undefined') {
  window.printJS = printJS
}
