const path = require('path')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: [
    './src/index.js'
  ],
  output: {
    library: 'printJS',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
    filename: 'print.js',
    sourceMapFilename: 'print.map',
    libraryExport: 'default'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      // TODO: Configure istanbul to interpret how webpack bundles files
      // {
      //   test: /\.js$/,
      //   use: {
      //     loader: 'istanbul-instrumenter-loader',
      //     options: { esModules: true }
      //   },
      //   enforce: 'post',
      //   exclude: /node_modules|\.spec\.js$/
      // },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'print.css'
    })
  ],
  optimization: {
    minimizer: [
      new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        canPrint: false
      }),
      new UglifyJSPlugin({
        sourceMap: true
      })
    ]
  }
}
