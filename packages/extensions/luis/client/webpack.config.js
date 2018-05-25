const { NodeEnvironmentPlugin } = require('webpack');
const path = require('path');
module.exports = {
  entry: {
    luis: path.resolve('./src/index.tsx')
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
      {
        test: /\.tsx$/,
        enforce: 'pre',
        loader: 'tslint-loader',
        options: { /* Loader options go here */ }
      },
    ],
  },

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
    path: path.resolve('./public'),
    filename: '[name].js',
    publicPath: 'http://localhost:8080',
  },

  stats: {
    warnings: false
  },

  externals: {},
  plugins: [
    new NodeEnvironmentPlugin()
  ]
};
