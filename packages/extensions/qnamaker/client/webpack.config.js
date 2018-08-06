const {
  NodeEnvironmentPlugin,
  NamedModulesPlugin,
  HotModuleReplacementPlugin,
  WatchIgnorePlugin } = require('webpack');
const path = require('path');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
module.exports = {
  entry: {
    qna: path.resolve('./src/index.tsx')
  },

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
              sourcemaps:true,
              banner: '// This is a generated file. Changes are likely to result in being overwritten'
            }
          },
          'resolve-url-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [ 'file-loader' ]
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      },
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
    new NamedModulesPlugin(),
    new HotModuleReplacementPlugin(),
    new NodeEnvironmentPlugin(),
    new HardSourceWebpackPlugin(),
    new NodeEnvironmentPlugin(),
    new WatchIgnorePlugin([
      './build/**/*.*',
      './public/**/*.*',
      './src/**/*.d.ts',
    ])
  ]
};
