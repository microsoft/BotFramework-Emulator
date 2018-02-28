var paths = require('react-scripts-ts/config/paths');

module.exports = function override(config) {
  config.module.rules.push({
    test: /\.(js|jsx)$/,
    include: paths.appSrc,
    loader: require.resolve('babel-loader'),
    options: {
      babelrc: false,
      cacheDirectory: true,
      presets: [require.resolve('babel-preset-react-app')]
    }
  });

  return config;
};
