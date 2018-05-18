var webpack = require('webpack');

module.exports = {
  entry: {
    app: ["./built/directLine.js"],
  },
  output: {
    libraryTarget: "umd",
    library: "DirectLine",
    filename: "./directLine.js",
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
    extensions: ['.js', '.json']
  },

  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  externals: {},
};
