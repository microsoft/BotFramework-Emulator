/** Generates a hash for the specified file */
function hashFileAsync(filename, algo = 'sha512', encoding = 'base64') {
  const builderUtil = require('builder-util');
  return builderUtil.hashFile(filename, algo, encoding);
}

/** Generates the .yml metadata file */
function writeYamlMetadataFile(version, releaseFilename, yamlFilename, path, fileHash, releaseDate, extra = {}) {
  const fsp = require('fs-extra');
  const yaml = require('js-yaml');

  const ymlInfo = {
    version,
    releaseDate,
    githubArtifactName: releaseFilename,
    path: releaseFilename,
    sha512: fileHash
  };
  const obj = {
    ...ymlInfo,
    ...extra
  };
  const ymlStr = yaml.safeDump(obj);
  fsp.writeFileSync(`./${path}/${yamlFilename}`, ymlStr);
}

module.exports = {
  hashFileAsync,
  writeYamlMetadataFile
};
