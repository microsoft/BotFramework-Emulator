const { NodeEnvironmentPlugin } = require('webpack');
const path = require('path');
module.exports = {
  entry: {
    BotChat: path.resolve('./src/BotChat.ts'),
    CognitiveServices: path.resolve('./src/CognitiveServices/lib.ts')
  },

  module: {
    rules: [
      { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
      {
        test: require.resolve('adaptivecards'),
        use: [{ loader: 'expose-loader', options: 'AdaptiveCards' }]
      }
    ],
  },

  node: {
    fs: 'empty'
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
    path: path.resolve('./dist'),
    filename: function (info) {
      const { chunk } = info;
      const { name } = chunk;
      return name === 'BotChat' ? 'botchat.js' : `${name}.js`;
    },
    libraryTarget: "umd",
    library: "[name]",
    publicPath: 'http://localhost:8080',
  },

  externals: {},
  plugins: [
    new NodeEnvironmentPlugin()
  ]
};
