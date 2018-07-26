const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const {
  NodeEnvironmentPlugin,
  DllPlugin,
  DllReferencePlugin,
  NamedModulesPlugin,
  HotModuleReplacementPlugin,
  DefinePlugin,
  WatchIgnorePlugin
} = webpack;
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

const { npm_lifecycle_event = '' } = process.env;
const manifestLocation = path.resolve('./generated');
const use = [
  {
    loader: 'babel-loader',
    options: {
      babelrc: false,
      plugins: ['react-hot-loader/babel'],
    },
  },
  'awesome-typescript-loader'
];
const defaultConfig = {
  entry: {
    index: require.resolve('./src/index.tsx')
  },

  target: 'electron-renderer',

  stats: {
    warnings: false
  },

  module: {
    rules: [
      {
        test: /\.(tsx?)|(jsx)$/,
        exclude: [/node_modules/],
        use: ['awesome-typescript-loader']
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'resolve-url-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(png|jpg|gif|svg|woff)$/,
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
              sourcemaps: true,
              camelCase: true,
              banner: '// This is a generated file. Changes are likely to result in being overwritten'
            }
          },
          'resolve-url-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.tsx?$/,
        loader: 'tslint-loader',
        options: {}
      }
    ]
  },

  devtool: 'source-map',

  devServer: {
    hot: true,
    inline: true,
    port: 3000,
    historyApiFallback: false
  },

  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx']
  },

  output: {
    path: path.resolve('./public'),
    filename: '[name].js',
    publicPath: 'http://localhost:3000/',
  },

  plugins: [
    new NamedModulesPlugin(),
    new HotModuleReplacementPlugin(),
    new NodeEnvironmentPlugin(),
    new HardSourceWebpackPlugin(),
    new CopyWebpackPlugin([
      { from: './src/inspector-preload.js', to: './' },
      { from: './src/index.html', to: './index.html' },
      { from: './src/ui/styles/themes/light.css', to: 'themes/light.css' },
      { from: './src/ui/styles/themes/dark.css', to: 'themes/dark.css' },
      { from: './src/ui/styles/themes/high-contrast.css', to: 'themes/high-contrast.css' },
      { from: './src/ui/styles/themes/neutral.css', to: 'css/neutral.css' },
      { from: './src/ui/styles/themes/fonts.css', to: 'css/fonts.css' },
      { from: './src/ui/styles/themes/redline.css', to: 'css/redline.css' },
      { from: require.resolve('@fuselab/ui-fabric/themes/seti/seti.woff'), to: 'external/media' },
    ]),
    new DefinePlugin({
      DEV: JSON.stringify((npm_lifecycle_event.includes("dev")))
    }),
    new WatchIgnorePlugin([
      './src/**/*.d.ts'
    ])
  ]
};

const buildConfig = mode => {
  const config = {
    ...defaultConfig,

    plugins: [
      ...defaultConfig.plugins,
      new DllReferencePlugin({ manifest: require(path.join(manifestLocation, 'vendors-manifest.json')) }),
      new DllReferencePlugin({ manifest: require(path.join(manifestLocation, 'shared-manifest.json')) })
    ]
  };
  if (mode === 'development') {
    config.module.rules[0].use = use;
  }
  return config;
};

const sharedConfig = () => ({
  ...defaultConfig,
  entry: {
    shared: [path.resolve('./src/shared.ts')]
  },

  output: {
    ...defaultConfig.output,
    library: '[name]_[hash]'
  },

  plugins: [
    ...defaultConfig.plugins,
    new DllPlugin({
      path: path.join(manifestLocation, 'shared-manifest.json'),
      name: '[name]_[hash]'
    }),

    new DllReferencePlugin({ manifest: require(path.join(manifestLocation, 'vendors-manifest.json')) })
  ]
});

const vendorsConfig = () => ({
  ...defaultConfig,
  entry: {
    vendors: [path.resolve('./src/vendors.ts')]
  },

  output: {
    ...defaultConfig.output,
    library: '[name]_[hash]'
  },

  plugins: [
    ...defaultConfig.plugins,
    new DllPlugin({
      path: path.join(manifestLocation, 'vendors-manifest.json'),
      name: '[name]_[hash]'
    })
  ]
});

const buildClassification = npm_lifecycle_event.split(':')[1];

module.exports = function (env, argv) {
  switch (buildClassification) {
    case 'vendors':
      return vendorsConfig();

    case 'shared':
      return sharedConfig();

    default:
      return buildConfig(argv.mode);
  }
};
