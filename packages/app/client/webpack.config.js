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

const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const { DllPlugin, DllReferencePlugin, DefinePlugin, WatchIgnorePlugin } = webpack;
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const { npm_lifecycle_event = '' } = process.env;
const manifestLocation = path.resolve('./generated');
const use = [
  {
    loader: 'babel-loader',
  },
];
const defaultConfig = () => ({
  entry: {
    index: require.resolve('./src/index.tsx'),
  },

  target: 'electron-renderer',

  stats: {
    warnings: false,
  },

  module: {
    rules: [
      {
        test: /\.(tsx?)|(jsx)$/,
        exclude: [/node_modules/],
        use: {
          loader: 'babel-loader',
          options: {
            ignore: ['**/*.spec.tsx?'],
          },
        },
      },
      {
        test: /\.css$/,
        include: [/node_modules/],
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        exclude: [/node_modules/],
        use: [
          'style-loader',
          'resolve-url-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif|svg|woff|woff2)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
        ],
      },
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
              modules: true,
              namedExport: true,
              camelCase: true,
              sourcemaps: true,
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
        test: /\.ttf$/,
        use: ['file-loader'],
      },
    ],
  },

  devtool: 'source-map',

  devServer: {
    static: path.resolve(__dirname, 'public'),
    hot: true,
    port: 3000,
    historyApiFallback: false,
  },

  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
  },

  output: {
    path: path.resolve('./public'),
    filename: '[name].js',
    publicPath: '/',
  },

  optimization: {
    moduleIds: 'named',
  },

  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/splash.html', to: './splash.html' },
        { from: './src/index.html', to: './index.html' },
        { from: './src/ui/styles/themes/light.css', to: 'themes/light.css' },
        { from: './src/ui/styles/themes/dark.css', to: 'themes/dark.css' },
        {
          from: './src/ui/styles/themes/high-contrast.css',
          to: 'themes/high-contrast.css',
        },
        { from: './src/ui/styles/themes/neutral.css', to: 'css/neutral.css' },
        { from: './src/ui/styles/themes/fonts.css', to: 'css/fonts.css' },
        { from: './src/ui/styles/themes/redline.css', to: 'css/redline.css' },
      ],
    }),
    new DefinePlugin({
      DEV: JSON.stringify(npm_lifecycle_event.includes('dev')),
    }),
    new WatchIgnorePlugin(['./src/**/*.d.ts']),
    new MonacoWebpackPlugin({
      languages: ['json'],
    }),
  ],
});

const buildConfig = mode => {
  const config = {
    ...defaultConfig(),
    plugins: [
      ...defaultConfig().plugins,
      new DllReferencePlugin({
        manifest: require(path.join(manifestLocation, 'vendors-manifest.json')),
      }),
      new DllReferencePlugin({
        manifest: require(path.join(manifestLocation, 'shared-manifest.json')),
      }),
    ],
  };
  if (mode === 'development') {
    config.module.rules[0].use = use;
  } else {
    config.optimization = {
      minimizer: [
        new TerserWebpackPlugin({
          cache: true,
          cacheKeys: defaultCacheKeys => {
            delete defaultCacheKeys['terser'];

            return Object.assign({}, defaultCacheKeys, { terser: require('terser/package.json').version });
          },
        }),
      ],
    };
  }
  return config;
};

const sharedConfig = () => ({
  ...defaultConfig(),
  entry: {
    shared: [path.resolve('./src/shared.ts')],
  },

  output: {
    ...defaultConfig().output,
    library: '[name]_[hash]',
  },

  node: {
    fs: 'empty',
  },

  plugins: [
    ...defaultConfig().plugins,
    new DllPlugin({
      path: path.join(manifestLocation, 'shared-manifest.json'),
      name: '[name]_[hash]',
    }),

    new DllReferencePlugin({
      manifest: require(path.join(manifestLocation, 'vendors-manifest.json')),
    }),
  ],
});

const vendorsConfig = () => ({
  ...defaultConfig(),
  entry: {
    vendors: [path.resolve('./src/vendors.ts')],
  },

  output: {
    ...defaultConfig().output,
    library: '[name]_[hash]',
  },

  plugins: [
    ...defaultConfig().plugins,
    new DllPlugin({
      path: path.join(manifestLocation, 'vendors-manifest.json'),
      name: '[name]_[hash]',
    }),
  ],
});

const buildClassification = npm_lifecycle_event.split(':')[1];

module.exports = function(env, argv) {
  switch (buildClassification) {
    case 'vendors':
      return vendorsConfig();

    case 'shared':
      return sharedConfig();

    default:
      return buildConfig(argv.mode);
  }
};
