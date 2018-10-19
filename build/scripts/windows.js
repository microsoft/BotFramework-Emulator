const { getEnvVar } = require('./utils');
const packageJson = require('../../package.json');
const platform = getEnvVar('EMU_PLATFORM', 'windows');
const version = getEnvVar('EMU_VERSION', packageJson.version);
const releaseFileName = `${packageJson.name}-${version}-${platform}-setup.exe`;
console.log(platform);
console.log(version);

writeLatestYml().catch(e => console.error(`Error while trying to write latest.yml: ${e}`));

/** Creates a checksum for the packaged installer and generates latest.yml */
async function writeLatestYml() {
  const sha512 = await hashFileAsync(`./dist/${releaseFileName}`);
  const sha2 = await hashFileAsync(`./dist/${releaseFileName}`, 'sha256', 'hex');
  const releaseDate = new Date().toISOString();

  writeYamlMetadataFile(
    releaseFileName,
    'latest.yml',
    './dist',
    sha512,
    releaseDate,
    { sha2 }
  );
}

/** Generates a hash for the specified file */
function hashFileAsync(filename, algo = 'sha512', encoding = 'base64') {
  const builderUtil = require('builder-util');
  return builderUtil.hashFile(filename, algo, encoding);
}

/** Generates the .yml metadata file */
function writeYamlMetadataFile(releaseFilename, yamlFilename, path, fileHash, releaseDate, extra = {}) {
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
