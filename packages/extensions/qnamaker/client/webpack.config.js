//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

const path = require('path');

const { WatchIgnorePlugin } = require('webpack');
const TerserWebpackPlugin = require('terser-webpack-plugin');

const buildConfig = mode => {
  const config = {
    optimization: {
      minimizer: [
        new TerserWebpackPlugin({
          cache: true,
          cacheKeys: defaultCacheKeys => {
            delete defaultCacheKeys['terser'];

            return Object.assign({}, defaultCacheKeys, { terser: require('terser/package.json').version });
          },
        }),
      ],
    },
    entry: {
      qna: path.resolve('./src/index.tsx'),
    },

    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            'style-loader',
            {
              loader: '@teamsupercell/typings-for-css-modules-loader',
              options: {
                banner: '// This is a generated file. Changes are likely to result in being overwritten',
              },
            },
            {
              loader: 'css-loader',
              options: {
                modules: {
                  namedExport: true,
                  exportLocalsConvention: 'camelCaseOnly',
                },
                sourceMap: true,
              },
            },
            'resolve-url-loader',
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          use: ['file-loader'],
        },
        {
          test: /\.(tsx?)|(jsx)$/,
          exclude: [/node_modules/],
          use: {
            loader: 'babel-loader',
            options: {
              ignore: ['**/*.spec.ts'],
            },
          },
        },
      ],
    },

    devServer: {
      static: path.resolve(__dirname, 'public'),
      port: 8080,
      historyApiFallback: false,
    },

    resolve: {
      extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    },

    output: {
      path: path.resolve('./public'),
      filename: '[name].js',
      publicPath: 'http://localhost:8080',
    },

    stats: {
      warnings: false,
    },
  };
  if (mode === 'development') {
    config.plugins = [new WatchIgnorePlugin(['./build/**/*.*', './public/**/*.*', './src/**/*.d.ts'])];
  }
  return config;
};

module.exports = function(env, argv) {
  return buildConfig(argv.mode);
};
