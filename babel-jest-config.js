const fs = require('fs-extra');
const path = require('path');

const babelOptions = fs.readJsonSync(path.join(__dirname, '.babelrc'));
const transformer = require('babel-jest');

const { createTransformer } = transformer;
const thisTransformer = createTransformer(babelOptions);

Object.assign(transformer, thisTransformer);
transformer.createTransformer = () => {
  return thisTransformer
};
module.exports = transformer;
