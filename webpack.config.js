const path = require('path')
const webpack = require('webpack'); // Added for ProvidePlugin
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin'); // Added
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// Determine mode based on NODE_ENV or CLI arguments. Default to development.
const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--mode=production');

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'eval-source-map',
  entry: [
    './src/index.ts'
  ],
  output: {
    library: 'printJS',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
    filename: isProduction ? 'print.[contenthash].js' : 'print.js',
    sourceMapFilename: isProduction ? 'print.js.[contenthash].map' : 'print.dev.js.map',
    libraryExport: 'default'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      "process": require.resolve("process/browser"),
      "buffer": require.resolve("buffer/"),
      "stream": require.resolve("stream-browserify"),
      "util": require.resolve("util/"),
      "crypto": require.resolve("crypto-browserify"),
      "path": require.resolve("path-browserify"),
    }
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
            // options: {
            //   sourceMap: true // This option is not valid here for MiniCssExtractPlugin > v1
            // }
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true // Re-enable for both dev and prod
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
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: isProduction ? 'print.css.[contenthash].css' : 'print.dev.css'
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    })
    // Removed explicit SourceMapDevToolPlugin, relying on devtool option
  ],
  optimization: {
    minimize: isProduction, // Explicitly set minimize based on mode
    minimizer: [
      new CssMinimizerPlugin(), // Replaced OptimizeCssAssetsPlugin
      new TerserPlugin({
        // cache: false, // Webpack 5 enables caching by default where possible. Consider removing or review necessity.
        parallel: true,
        // sourceMap: true, // This option is deprecated in TerserWebpackPlugin v5, source maps are controlled by devtool
        terserOptions: {
          mangle: true,
          // ie8: true, // ie8 support dropped in terser 5.x
          // safari10: true // safari10 support is generally on by default
        }
      })
    ]
  },
  // Webpack 5 defaults target to 'browserslist' if a browserslist config is present, or 'web' otherwise.
  // No explicit target needed unless specific older browser support not covered by browserslist is required.
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'), // Serve from the dist directory
    },
    port: 8080, // Desired port
    historyApiFallback: true, // For single-page app routing
    hot: true, // Enable Hot Module Replacement
    // open: true, // This can be kept in package.json or moved here, e.g. open: ['/test/manual/index.html']
  }
}
