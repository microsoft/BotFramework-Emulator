const { NodeEnvironmentPlugin } = require('webpack');
const path = require('path');
module.exports = {
  entry: {
    qna: path.resolve('./src/index.jsx')
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192
            }
          }
        ]
      },
      {
        test: /\.(tsx?)|(jsx)$/,
        exclude: [/node_modules/],
        loader: "awesome-typescript-loader"
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
    path: path.resolve('./build/dist'),
    filename: '[name].js',
    publicPath: 'http://localhost:8080',
  },

  externals: {},
  plugins: [
    new NodeEnvironmentPlugin()
  ]
};
