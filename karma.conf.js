// const path = require('path')

module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      'test/**/*.spec.js'
    ],
    exclude: [],
    preprocessors: {
      'test/**/*.js': ['webpack', 'sourcemap', 'coverage']
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
      mode: 'development'
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
