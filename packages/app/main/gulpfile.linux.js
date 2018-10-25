const gulp = require('gulp');
const common = require('./gulpfile.common.js');
const packageJson = require('./package.json');

/** Package the emulator using electron-builder
 *  and output artifacts to /dist/
 */
gulp.task('package', async () => {
  const { getElectronMirrorUrl, getConfig, getReleaseFilename } = common;
  const rename = require('gulp-rename');
  const builder = require('electron-builder');
  const config = getConfig('linux');

  console.log(`Electron mirror: ${getElectronMirrorUrl(getReleaseFilename)}`);

  // create build artifacts
  const filenames = await builder.build({
    targets: builder.Platform.LINUX.createTarget(['deb', 'AppImage'], builder.Arch.ia32),
    config
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

/** Generates latest-linux.yml */
gulp.task('redist:metadata-only', async () => {
  const { hashFileAsync, getReleaseFilename } = common;
  const releaseFileName = `${getReleaseFilename()}.AppImage`;
  const sha512 = await hashFileAsync(`./dist/${releaseFileName}`);
  const releaseDate = new Date().toISOString();

  writeYamlMetadataFile(
    releaseFileName,
    'latest-linux-ia32.yml',
    './dist',
    sha512,
    releaseDate
  );
});

/** Writes the .yml metadata file */
function writeYamlMetadataFile(releaseFilename, yamlFilename, path, fileHash, releaseDate) {
  const { getEnvironmentVar } = common;
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
  const ymlStr = yaml.safeDump(ymlInfo);
  fsp.writeFileSync(`./${path}/${yamlFilename}`, ymlStr);
}
