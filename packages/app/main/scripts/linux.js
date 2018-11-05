writeLatestYmlFile().catch(e => console.error(e));

/** Generates latest-linux.yml & latest-linux-ia32.yml */
async function writeLatestYmlFile() {
  const common = require('./common');
  const packageJson = require('../package.json');
  const { hashFileAsync } = common;
  
  const version = process.env.EMU_VERSION || packageJson.version;
  const releaseFileNameBase = `BotFramework-Emulator-${version}`;

  const thirtyTwoBitReleaseFileName = `${releaseFileNameBase}-i386.AppImage`;
  const thirtyTwoBitSha512 = await hashFileAsync(`./dist/${thirtyTwoBitReleaseFileName}`);

  const sixtyFourBitReleaseFileName = `${releaseFileNameBase}-x86_64.AppImage`;
  const sixtyFourBitSha512 = await hashFileAsync(`./dist/${sixtyFourBitReleaseFileName}`);

  const releaseDate = new Date().toISOString();

  performWrite(
    thirtyTwoBitReleaseFileName,
    'latest-linux-ia32.yml',
    thirtyTwoBitSha512,
    releaseDate,
    version
  );

  performWrite(
    sixtyFourBitReleaseFileName,
    'latest-linux.yml',
    sixtyFourBitSha512,
    releaseDate,
    version
  );
};

function performWrite(releaseFilename, yamlFilename, fileHash, releaseDate, version) {
  const fsp = require('fs-extra');
  const yaml = require('js-yaml');
  const path = require('path');

  const ymlInfo = {
    version,
    releaseDate,
    githubArtifactName: releaseFilename,
    path: releaseFilename,
    sha512: fileHash
  };
  const ymlStr = yaml.safeDump(ymlInfo);
  fsp.writeFileSync(path.normalize(`./dist/${yamlFilename}`), ymlStr);
}
