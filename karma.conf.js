// const path = require('path')

module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      'test/**/*.spec.js',
      'test/**/*.spec.ts'
    ],
    exclude: [],
    preprocessors: {
      'test/**/*.js': ['webpack', 'sourcemap', 'coverage'],
      'test/**/*.ts': ['webpack', 'sourcemap', 'coverage']
    },
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      dir: 'coverage/',
      type: 'lcov',
      subdir: '.',
      includeAllSources: true,
      fixWebpackSourcePaths: true,
      combineBrowserReports: true
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_ERROR,
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    concurrency: 1,
    webpack: {
      mode: 'development',
      resolve: {
        extensions: ['.ts', '.js']
      },
      module: {
        rules: [
          {
            test: /\.ts$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'ts-loader',
                options: {
                  transpileOnly: true
                }
              }
            ]
          },
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: 'babel-loader'
          },
          {
            test: /\.scss$/,
            use: [
              'style-loader', // In Karma, style-loader is often simpler than MiniCssExtractPlugin
              'css-loader',
              'sass-loader'
            ]
          }
        ]
      }
      // TODO: Configure istanbul to interpret how webpack bundles files
      // module: {
      //   rules: [
      //     {
      //       test: /\.js$/,
      //       use: { loader: 'istanbul-instrumenter-loader' },
      //       include: path.resolve('src/js/index.js')
      //     }
      //   ]
      // }
    }
  })
}
