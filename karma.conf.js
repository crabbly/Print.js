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
      'test/**/*.js': ['webpack', 'sourcemap'],
      'test/**/*.ts': ['webpack', 'sourcemap']
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
      // istanbul-instrumenter-loader and its configuration have been removed
    }
  })
}
