const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {
  ENTRY_PATH,
  LESS_HELPERS_PATH,
  ASSETS_ROOT_PATH,
  IMAGE_LOADER_PATH,
  INDEX_HTML_PATH,
  STATIC_PATH,
  IMAGES_PATH
} = require("./webpackPathsConsts");

module.exports = {
  mode: 'none',
  devtool: 'source-map',
  entry: ENTRY_PATH,
  output: {
    path: path.resolve(__dirname, 'dist'),
    // publicPath: IMAGES_PATH,
    filename: 'bundle.js'
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules'
    ],
    alias: {
      '@less-helpers-module': path.resolve(__dirname, LESS_HELPERS_PATH), // alias for less helpers
      '@assets-root-path': path.resolve(__dirname, ASSETS_ROOT_PATH), // alias for assets (use for images & fonts)
      'handlebars' : 'handlebars/runtime.js'
    },
    // fallback: {
    //   "path": require.resolve("path-browserify"),
    //   "os": require.resolve("os-browserify/browser"),
    //   "crypto": require.resolve("crypto-browserify"),
    //   "stream": require.resolve("stream-browserify"),
    //   "fs": false
    // }
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules)/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        },
        {
          loader: 'eslint-loader',
          options: {
            fix: true,
          },
        },
        {
          loader: 'prettier-loader',
          options: {
            printWidth: 80,
            semi: true,
            singleQuote: true,
            parser: 'babel'
          }
        }
      ]
    }, {
      test: /\.handlebars$/,
      loader: 'handlebars-loader'
    }, {
      test: /\.css$/,
      use: ["style-loader","css-loader"]
    }, {
      test: /\.less$/,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
        'less-loader'
      ]
    }, {
      test: /\.(jpg|jpeg|png|svg|gif)$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: IMAGE_LOADER_PATH,
          esModule: false
        }
      }]
    }, {
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      use: [{
        loader: "file-loader",
      }],
    }]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'styles.css'
    }),
    new CopyWebpackPlugin([
      INDEX_HTML_PATH,
      {
        from: IMAGES_PATH,
        to: 'images'
      }
    ]),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery'",
      "window.$": "jquery"
    })
  ],
  devServer: {
    static: './dist',
    port: 3000,
    historyApiFallback: true
  }
  // devServer: {
  //   contentBase: './dist',
  //   port: 3000,
  //   historyApiFallback: true
  // }
};


