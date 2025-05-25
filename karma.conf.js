// const path = require('path')

module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      { pattern: 'src/**/*.ts', type: 'module', included: false },
      { pattern: 'test/**/*.spec.ts', type: 'module' },
      { pattern: 'test/**/*.spec.js', type: 'module', included: true, nocache: true }
    ],
    exclude: [],
    preprocessors: {
      'test/**/*.spec.js': ['sourcemap'],
      'test/**/*.spec.ts': ['sourcemap']
    },
    reporters: ['progress'], // Removed 'coverage' for now
    // coverageReporter: { // Removed coverage reporter config for now
    //   dir: 'coverage/',
    //   type: 'lcov',
    //   subdir: '.',
    //   includeAllSources: true,
    //   fixWebpackSourcePaths: true,
    //   combineBrowserReports: true
    // },
    port: 9876,
    colors: true,
    logLevel: config.LOG_ERROR,
    autoWatch: false,
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    browsers: ['ChromeHeadlessCI'],
    singleRun: true,
    concurrency: 1,
    mime: {
      'text/x-typescript': ['ts','tsx']
    }
    // Webpack configuration removed
  })
}
