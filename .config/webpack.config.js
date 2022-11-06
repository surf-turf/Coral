const path = require('path');
const webpack = require('webpack');
const extendersEntries = require('./extenders');
const getPackageJson = require('../src/scripts/utils/getPackageJson.js');

// Webpack plugins
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');

const {
  version,
  name,
  license,
  repository,
} = getPackageJson('version', 'name', 'license', 'repository', 'author');

// Directories
const rootDir = path.dirname(__dirname)
const srcDir = path.join(rootDir, 'src')
const scriptsDir = path.join(srcDir, 'scripts')
const stylesDir = path.join(srcDir, 'styles')

const banner = `
  ${name} v${version}
  ${repository.url}

  Copyright (c) Surf&Turf and project contributors.

  This source code is licensed under the ${license} license found in the
  LICENSE file in the root directory of this source tree.
`;

module.exports = {
  mode: "production",
  devtool: 'source-map',
  entry: {
    ...extendersEntries(),
  },
  output: {
    filename: '[name].js',
    path: path.resolve(rootDir, 'lib'),
    library: 'Coral',
    libraryTarget: 'umd',
    clean: true
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({ extractComments: true }),
      new CssMinimizerPlugin()
    ]
  },
  resolve: {
    alias: {
      styles: stylesDir,
      scripts: scriptsDir,
    },
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          // Creates `style` nodes from JS strings
          MiniCssExtractPlugin.loader,
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: '[name].css' }),
    new webpack.BannerPlugin(banner),
  ],
};