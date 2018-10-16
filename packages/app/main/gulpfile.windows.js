const common = require('./gulpfile.common.js');
const gulp = require('gulp');
const packageJson = require('./package.json');

/** Package the emulator using electron-builder */
gulp.task('stage', async () => {
  const { getConfig, getElectronMirrorUrl } = common;
  const builder = require('electron-builder');
  const config = getConfig('windows', 'dir');

  console.log(`Electron mirror: ${getElectronMirrorUrl()}`);

  // create build artifacts
  await builder.build({
    targets: builder.Platform.WINDOWS.createTarget(['dir'], builder.Arch.ia32, builder.Arch.x64),
    config
  });
});

/** Creates the emulator installers */
gulp.task('redist:binaries', async () => {
  const { getConfig, getElectronMirrorUrl, getReleaseFilename } = common;
  var rename = require('gulp-rename');
  var builder = require('electron-builder');
  const config = getConfig("windows", "nsis");

  console.log(`Electron mirror: ${getElectronMirrorUrl()}`);

  // create installers
  const filenames = await builder.build({
    targets: builder.Platform.WINDOWS.createTarget(["nsis"], builder.Arch.ia32),
    config,
    prepackaged: './dist/win-ia32-unpacked'
  });

  // rename and move the files to the /dist/ directory
  await new Promise(resolve => {
    gulp
      .src(filenames, { allowEmpty: true })
      .pipe(rename(path => {
        path.basename = getReleaseFilename();
      }))
      .pipe(gulp.dest('./dist'))
      .on('end', resolve);
  });
});

/** Writes the build metadata to latest.yml  */
gulp.task('redist:metadata-only', async () => {
  const { getConfig, hashFileAsync, getEnvironmentVar } = common;
  const config = getConfig('windows', 'nsis');
  const version = getEnvironmentVar('EMU_VERSION', packageJson.version);
  const releaseFilename = config.nsis.artifactName.replace('${version}', version);
  const sha512 = await hashFileAsync(`./dist/${releaseFilename}`);
  const sha2 = await hashFileAsync(`./dist/${releaseFilename}`, 'sha256', 'hex');
  const releaseDate = new Date().toISOString();

  writeYamlMetadataFile(
    releaseFilename,
    'latest.yml',
    './dist',
    sha512,
    releaseDate,
    { sha2 }
  );
});

/** Writes the .yml metadata file */
function writeYamlMetadataFile(releaseFilename, yamlFilename, path, fileHash, releaseDate, extra = {}) {
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
}
