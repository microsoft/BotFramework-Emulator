const path = require('path');
const webpack = require('webpack');
const { NodeEnvironmentPlugin, DllPlugin, DllReferencePlugin, NamedModulesPlugin, HotModuleReplacementPlugin, DefinePlugin } = webpack;

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
  'awesome-typescript-loader',
];
const defaultConfig = {
  entry: {
    index: path.resolve('./src/index.tsx')
  },

  node: {
    fs: 'empty'
  },

  module: {
    rules: [
      {
        test: /\.(tsx?)|(jsx)$/,
        exclude: [/node_modules/],
        use: use.slice(1)
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
    new NodeEnvironmentPlugin()
  ]
};

const buildConfig = () => {
  const config = {
    ...defaultConfig,

    plugins: [
      ...defaultConfig.plugins,
      new DllReferencePlugin({ manifest: require(path.join(manifestLocation, 'vendors-manifest.json')) }),
      new DllReferencePlugin({ manifest: require(path.join(manifestLocation, 'shared-manifest.json')) })
    ]
  };
  config.module.rules[0].use = use;
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

switch (buildClassification) {
  case 'vendors':
    module.exports = vendorsConfig();
    break;

  case 'shared':
    module.exports = sharedConfig();
    break;

  default:
    module.exports = buildConfig();
    break;
}
