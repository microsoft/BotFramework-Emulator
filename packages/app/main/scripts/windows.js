writeLatestYmlFile().catch(e => console.error(e));

/** Writes the build metadata to latest.yml  */
async function writeLatestYmlFile() {
  const common = require('./common.js');
  const packageJson = require('../package.json');
  const fsp = require('fs-extra');
  const yaml = require('js-yaml');
  const path = require('path');
  const { hashFileAsync } = common;

  const version = process.env.EMU_VERSION || packageJson.version;
  const releaseFilename = `BotFramework-Emulator-${version}-windows-setup.exe`;
  const sha512 = await hashFileAsync(path.normalize(`./dist/${releaseFilename}`));
  const sha2 = await hashFileAsync(path.normalize(`./dist/${releaseFilename}`), 'sha256', 'hex');
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
  fsp.writeFileSync(path.normalize(`./dist/latest.yml`), ymlStr);
};
