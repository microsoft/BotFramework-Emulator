const fs = require('fs-extra');

const babelOptions = fs.readJsonSync('.babelrc');
const transformer = require('babel-jest');

const { createTransformer } = transformer;
const thisTransformer = createTransformer(babelOptions);

Object.assign(transformer, thisTransformer);
transformer.createTransformer = () => thisTransformer;
module.exports = transformer;
