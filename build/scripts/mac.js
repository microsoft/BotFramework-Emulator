const { hashFileAsync, writeYamlMetadataFile } = require('./utils');
const packageJson = require('../../package.json');
const platform = process.env['EMU_PLATFORM'] ||  'mac';
const version = process.env['EMU_VERSION'] ||  packageJson.version;
const releaseFileName = `${packageJson.name}-${version}-${platform}.zip`;

writeLatestYml().catch(e => console.error(`Error while trying to write latest-mac.yml: ${e}`));

/** Creates a checksum for the packaged installer and generates latest.yml */
async function writeLatestYml() {
  const sha512 = await hashFileAsync(`./dist/${releaseFileName}`);
  const releaseDate = new Date().toISOString();

  writeYamlMetadataFile(
    version,
    releaseFileName,
    'latest-mac.yml',
    './dist',
    sha512,
    releaseDate
  );
}
