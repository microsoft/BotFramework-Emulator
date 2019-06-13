const { WatchIgnorePlugin } = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
module.exports = {
  entry: {
    index: path.resolve('./src/index.tsx'),
  },
  devtool: 'source-map',
  target: 'electron-renderer',
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'typings-for-css-modules-loader',
            options: {
              localIdentName: '[local]__[hash:base64:5]',
              modules: true,
              sass: false,
              namedExport: true,
              camelCase: true,
              sourcemaps: true,
              banner: '// This is a generated file. Changes are likely to result in being overwritten',
            },
          },
          'resolve-url-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: ['file-loader'],
      },
      {
        test: /\.(tsx?)|(jsx?)$/,
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
    hot: true,
    inline: true,
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

  externals: {},
  plugins: [
    new WatchIgnorePlugin(['./build/**/*.*', './public/**/*.*', './src/**/*.d.ts']),
    new CopyWebpackPlugin([{ from: './src/index.html', to: './index.html' }]),
  ],
};
