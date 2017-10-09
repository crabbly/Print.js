const { mix } = require('laravel-mix')

mix.js('src/index.js', 'dist/print.min.js').styles('src/css/print.css', 'dist/print.min.css')
