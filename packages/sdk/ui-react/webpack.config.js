const { NodeEnvironmentPlugin } = require('webpack');
const path = require('path');
module.exports = {
  entry: {
    index: path.resolve('./src/index.ts'),
  },

  devtool: 'inline-source-map',

  module: {
    rules: [
      {
        test: /\.(tsx?)|(jsx)$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              plugins: ['react-hot-loader/babel'],
            },
          },
          'awesome-typescript-loader',
        ],
      },
      {
        test: /\.tsx?$/,
        loader: 'tslint-loader',
        options: { /* Loader options go here */ }
      },
      {
        test: /\.svg$/,
        loader: 'svg-url-loader',
        options: { noquotes: true }
      }
    ]
  },

  node: {
    fs: 'empty'
  },

  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx']
  },

  output: {
    path: path.resolve('./built'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: "[name]",
  },

  externals: {},
  plugins: [
    new NodeEnvironmentPlugin()
  ]
};
