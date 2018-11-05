writeLatestYmlFile().catch(e => console.error(e));

/** Writes the build metadata to latest.yml  */
async function writeLatestYmlFile() {
  const common = require('./gulpfile.common.js');
  const packageJson = require('./package.json');
  const fsp = require('fs-extra');
  const yaml = require('js-yaml');
  const path = require('path');
  const { hashFileAsync } = common;

  const version = process.env.EMU_VERSION || packageJson.version;
  const releaseFilename = `BotFramework-Emulator-${version}-windows-setup.exe`;
  const sha512 = await hashFileAsync(`./dist/${releaseFilename}`);
  const sha2 = await hashFileAsync(`./dist/${releaseFilename}`, 'sha256', 'hex');
  const releaseDate = new Date().toISOString();

  const ymlInfo = {
    version,
    releaseDate,
    githubArtifactName: releaseFilename,
    path: releaseFilename,
    sha512,
    sha2
  };
  const ymlStr = yaml.safeDump(ymlInfo);
  fsp.writeFileSync(path.resolve(`./dist/${releaseFilename}`), ymlStr);

  /*writeYamlMetadataFile(
    releaseFilename,
    'latest.yml',
    './dist',
    sha512,
    releaseDate,
    { sha2 }
  );*/
};

/** Writes the .yml metadata file */
/*function writeYamlMetadataFile(releaseFilename, yamlFilename, path, fileHash, releaseDate, extra = {}) {
  const { extend, getEnvironmentVar } = common;
  var fsp = require('fs-extra');
  var yaml = require('js-yaml');
  const version = getEnvironmentVar('EMU_VERSION', packageJson.version);

  const ymlInfo = {
    version,
    releaseDate,
    githubArtifactName: releaseFilename,
    path: releaseFilename,
    sha512: fileHash
  };
  const obj = extend({}, ymlInfo, extra);
  const ymlStr = yaml.safeDump(obj);
  fsp.writeFileSync(`./${path}/${yamlFilename}`, ymlStr);
}*/
