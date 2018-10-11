const gulp = require('gulp');
const common = require('./gulpfile.common.js');
const packageJson = require('./package.json');

/** Package the emulator using electron-builder
 *  and output artifacts to /dist/
 */
gulp.task('package', async () => {
  const { getElectronMirrorUrl, getConfig } = common;
  const rename = require('gulp-rename');
  const builder = require('electron-builder');
  const config = getConfig('linux');

  console.log(`Electron mirror: ${getElectronMirrorUrl()}`);

  // create build artifacts
  const filenames = await builder.build({
    targets: builder.Platform.LINUX.createTarget(['deb', 'AppImage'], builder.Arch.ia32, builder.Arch.x64),
    config
  });

  // rename and move the files to the /dist/ directory
  await new Promise(resolve => {
    gulp
      .src(filenames, { allowEmpty: true })
      .pipe(rename(path => {
        path.basename = getReleaseFilename(path.basename);
      }))
      .pipe(gulp.dest('./dist'))
      .on('end', resolve);
  });
});

/** Sets the packaged artifact filenames */
function getReleaseFilename() {
  const { getEnvironmentVar } = common;
  const releaseVersion = getEnvironmentVar('EMU_VERSION', packageJson.version);
  const releasePlatform = getEnvironmentVar('EMU_PLATFORM');
  if (!releasePlatform) {
    throw new Error('Environment variable EMU_PLATFORM missing. Please retry with valid value.');
  }
  const releaseName = `${packageJson.packagename}-${releaseVersion}-${releasePlatform}`;

  return releaseName;
}
