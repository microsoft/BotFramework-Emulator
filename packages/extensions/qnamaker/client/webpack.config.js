const { HotModuleReplacementPlugin, WatchIgnorePlugin } = require('webpack');
const path = require('path');
module.exports = {
  entry: {
    qna: path.resolve('./src/index.tsx'),
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
    new HotModuleReplacementPlugin(),
    new WatchIgnorePlugin(['./build/**/*.*', './public/**/*.*', './src/**/*.d.ts']),
  ],
};
