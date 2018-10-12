const gulp = require('gulp');
const common = require('./gulpfile.common.js');

/** Package the emulator using electron-builder
 *  and output artifacts to /dist/
 */
gulp.task('package', async () => {
  const { getElectronMirrorUrl, getConfig } = common;
  const rename = require('gulp-rename');
  const builder = require('electron-builder');
  const config = getConfig('linux');

  console.log(`Electron mirror: ${getElectronMirrorUrl(getReleaseFilename)}`);

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
        path.basename = getReleaseFilename();
      }))
      .pipe(gulp.dest('./dist'))
      .on('end', resolve);
  });
});
