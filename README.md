# Print.js

[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat)](LICENSE)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](http://standardjs.com/)
[![npm](https://img.shields.io/npm/v/print-js.svg)](https://www.npmjs.com/package/print-js-with-headers-footers)

A tiny javascript library to help printing from the web.

## Installation

You can download the latest version of Print.js from the [GitHub releases](https://github.com/crabbly/Print.js/releases/latest) or use the [Print.js CDN](http://printjs.crabbly.com/#cdn) available on the documentation page.

To install via npm:

```bash
npm install print-js-with-headers-footers --save
```

Import the library into your project:

```js
import printJS from 'print-js-with-headers-footers'
```

##### Setting up a dev environment

```bash
npm install
npm run watch
```

##### Tests

The library is written following the [Javascript Standard](https://standardjs.com) code style. When running tests, we will also test for any style issues or warnings.

Automated tests are written using the [Jasmine](https://jasmine.github.io) framework and [Karma](https://karma-runner.github.io) runner.

To run the automated tests:

```bash
npm run test
```

To manually test the library features:

```bash
npm start
```

This will serve `test\manual\test.html` and open `http://localhost:8080/test/manual` in your default browser.

## License

Print.js is available under the [MIT license](https://github.com/crabbly/Print.js/blob/master/LICENSE).
