const { mix } = require('laravel-mix')

mix.js('src/index.js', 'dist/print.min.js').styles('src/css/print.css', 'dist/print.min.css')

mix.webpackConfig({
  output: {
    library: 'print-js',
    libraryTarget: 'umd',
    umdNamedDefine: true
  }
})
