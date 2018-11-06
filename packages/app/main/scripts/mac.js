// /** Package the emulator using electron-builder */
// gulp.task('stage', async () => {
//   const { getElectronMirrorUrl, getConfig } = common;
//   const builder = require('electron-builder');
//   const config = getConfig('mac', 'dir');

//   console.log(`Electron mirror: ${getElectronMirrorUrl()}`);

//   // create build artifacts
//   await builder.build({
//     targets: builder.Platform.MAC.createTarget(['dir']),
//     config
//   });
// });

// /** Creates the emulator installers */
// gulp.task('redist:binaries', async () => {
//   const { getElectronMirrorUrl, getConfig, getReleaseFilename } = common;
//   const rename = require('gulp-rename');
//   const builder = require('electron-builder');
//   const config = getConfig('mac');

//   console.log(`Electron mirror: ${getElectronMirrorUrl()}`);

//   // create installers
//   const filenames = await builder.build({
//     targets: builder.Platform.MAC.createTarget(['zip', 'dmg']),
//     config,
//     prepackaged: './dist/mac'
//   });

//   // rename and move the files to the /dist/ directory
//   await new Promise(resolve => {
//     gulp
//       .src(filenames, { allowEmpty: true })
//       .pipe(rename(path => {
//         path.basename = getReleaseFilename();
//       }))
//       .pipe(gulp.dest('./dist'))
//       .on('end', resolve);
//   });
// });

writeLatestYmlFile().catch(e => console.error(e));

/** Creates the .yml and .json metadata files */
async function writeLatestYmlFile() {
  const common = require('./common');
  const packageJson = require('../package.json');
  const path = require('path');
  const { hashFileAsync } = common;

  const version = process.env.EMU_VERSION || packageJson.version;
  const releaseFilename = `BotFramework-Emulator-${version}-mac.zip`;
  const sha512 = await hashFileAsync(path.normalize(`./dist/${releaseFilename}`));
  const releaseDate = new Date().toISOString();

  const ymlInfo = {
    version,
    releaseDate,
    githubArtifactName: releaseFilename,
    path: releaseFilename,
    sha512
  };
  const ymlStr = yaml.safeDump(ymlInfo);
  fsp.writeFileSync(path.normalize('./dist/latest-mac.yml'), ymlStr);
};

// /** Writes the .yml metadata file */
// function writeYamlMetadataFile(releaseFilename, yamlFilename, path, fileHash, releaseDate, extra = {}) {
//   const fsp = require('fs-extra');
//   const yaml = require('js-yaml');

//   const ymlInfo = {
//     version,
//     releaseDate,
//     githubArtifactName: releaseFilename,
//     path: releaseFilename,
//     sha512: fileHash
//   };
//   const obj = extend({}, ymlInfo, extra);
//   const ymlStr = yaml.safeDump(obj);
//   fsp.writeFileSync(`./${path}/${yamlFilename}`, ymlStr);
// }
