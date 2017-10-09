const { mix } = require('laravel-mix')

mix.js('src/index.js', '../print.js_docs/print.js').styles('src/css/print.css', 'dist/print.min.css')
