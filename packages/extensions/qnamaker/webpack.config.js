const { HotModuleReplacementPlugin, WatchIgnorePlugin } = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');

const buildConfig = mode => {
  const config = {
    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          cache: true,
          cacheKeys(defaultCacheKeys) {
            delete defaultCacheKeys['uglify-js'];

            return Object.assign({}, defaultCacheKeys, { 'uglify-js': require('uglify-js/package.json').version });
          },
          minify(file, sourceMap) {
            // https://github.com/mishoo/UglifyJS2#minify-options
            const uglifyJsOptions = {
              /* your `uglify-js` package options */
            };

            if (sourceMap) {
              uglifyJsOptions.sourceMap = {
                content: sourceMap,
              };
            }

            return require('terser').minify(file, uglifyJsOptions);
          },
        }),
      ],
    },
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
  };
  if (mode === 'development') {
    config.plugins = [
      new HotModuleReplacementPlugin(),
      new WatchIgnorePlugin(['./build/**/*.*', './public/**/*.*', './src/**/*.d.ts']),
    ];
  }
  return config;
};

module.exports = function(env, argv) {
  return buildConfig(argv.mode);
};
