/** Hashes a file asynchronously */
function hashFileAsync(filename, algo = 'sha512', encoding = 'base64') {
  var builderUtil = require('builder-util');
  return builderUtil.hashFile(filename, algo, encoding);
}

exports = {
  hashFileAsync
};
