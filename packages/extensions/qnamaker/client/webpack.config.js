const { NodeEnvironmentPlugin } = require('webpack');
const path = require('path');
module.exports = {
  entry: {
    qna: path.resolve('./src/index.tsx')
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: [/node_modules/],
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.tsx?$/,
        exclude: [/node_modules/],
        loader: 'awesome-typescript-loader'
      },
    ],
  },

  devtool: 'source-map',

  // node: {
  //   fs: 'empty',
  //   net: 'empty',
  //   tls: 'empty'
  // },

  devServer: {
    hot: true,
    inline: true,
    port: 8080,
    historyApiFallback: false
  },

  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx']
  },

  output: {
    path: path.resolve('./build/dist'),
    filename: '[name].js',
    publicPath: 'http://localhost:8080',
  },

  externals: {},
  plugins: [
    new NodeEnvironmentPlugin()
  ]
};
