var elixir = require('laravel-elixir')
elixir.config.assetsPath = 'src'
elixir.config.js.folder = ''
elixir.config.css.folder = ''

elixir(function (mix) {
  mix.webpack('print.js', 'dist/print.min.js')
      .styles('css/print.css', 'dist/print.min.css')
})
