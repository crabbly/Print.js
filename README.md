# Print.js

[![Build Status](https://travis-ci.org/crabbly/Print.js.svg?branch=master)](https://travis-ci.org/crabbly/Print.js)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat)](LICENSE)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](http://standardjs.com/)
[![npm](https://img.shields.io/npm/v/print-js.svg)](https://www.npmjs.com/package/print-js)

A tiny javascript library to help printing from the web.

>For documentation and examples please visit: [printjs.crabbly.com](http://printjs.crabbly.com)


## Installation

You can download the latest version of Print.js from the [GitHub releases](https://github.com/crabbly/Print.js/releases/latest) or use the [Print.js CDN](http://printjs.crabbly.com/#cdn) available on the documentation page.

To install via npm:

```bash
npm install print-js --save
```

To install via yarn:

```bash
yarn add print-js
```

When installing via npm or yarn, import the library into your project:

```js
import printJS from 'print-js'
```

## Documentation

You can find documentation at [printjs.crabbly.com](http://printjs.crabbly.com/#documentation).


## Contributing to Print.js

[![devDependencies Status](https://david-dm.org/crabbly/print.js/dev-status.svg)](https://david-dm.org/crabbly/print.js?type=dev)
[![dependencies Status](https://david-dm.org/crabbly/print.js/status.svg)](https://david-dm.org/crabbly/print.js)
[![slack](https://img.shields.io/badge/slack-printjs-orange.svg?logo=slack)](https://publicslack.com/slacks/printjs/invites/new)

Contributions to Print.js are welcome and encouraged.


##### Using issues

The [issue tracker](https://github.com/crabbly/Print.js/issues) is the preferred channel for reporting bugs, requesting new features and submitting pull requests.

Keep in mind that we would like to keep this a lightweight library.

Please do not use the issues channel for support requests. For help using Print.js, please ask questions on Stack Overflow and use the tag `printjs`.


##### Reporting bugs

Well structured, detailed bug reports are hugely valuable for the project.

 - Check the issue search to see if it has already been reported
 - Isolate the problem to a simple test case

Please provide any additional details associated with the bug.


##### Pull requests

Clear, concise pull requests are excellent at continuing the project's community driven growth.  

Please make your commits in logical sections with clear commit messages.  

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
