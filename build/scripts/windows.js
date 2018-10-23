const { hashFileAsync, writeYamlMetadataFile } = require('./utils');
const packageJson = require('../../package.json');
const platform = process.env['EMU_PLATFORM'] || 'windows';
const version = process.env['EMU_VERSION'] || packageJson.version;
const releaseFileName = `${packageJson.name}-${version}-${platform}-setup.exe`;

writeLatestYml().catch(e => console.error(`Error while trying to write latest.yml: ${e}`));

/** Creates a checksum for the packaged installer and generates latest.yml */
async function writeLatestYml() {
  const sha512 = await hashFileAsync(`./dist/${releaseFileName}`);
  const sha2 = await hashFileAsync(`./dist/${releaseFileName}`, 'sha256', 'hex');
  const releaseDate = new Date().toISOString();

  writeYamlMetadataFile(
    version,
    releaseFileName,
    'latest.yml',
    './dist',
    sha512,
    releaseDate,
    { sha2 }
  );
}
