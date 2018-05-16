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
    path: path.resolve('./build/dist'),
    filename: '[name].js',
    publicPath: 'http://localhost:8080',
  },

  externals: {},
  plugins: [
    new NodeEnvironmentPlugin()
  ]
};
