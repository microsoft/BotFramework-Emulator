const gulp = require('gulp');
const common = require('./gulpfile.common.js');
const packageJson = require('./package.json');

/** Package the emulator using electron-builder
 *  and output artifacts to /dist/
 */
gulp.task('package', async () => {
  var rename = require('gulp-rename');
  var builder = require('electron-builder');
  const config = getConfig("linux");
  const { getElectronMirrorUrl } = common;

  console.log(`Electron mirror: ${getElectronMirrorUrl()}`);

  // create packaged artifacts
  const filenames = await builder.build({
    targets: builder.Platform.LINUX.createTarget(["deb", "AppImage"], builder.Arch.ia32, builder.Arch.x64),
    config
  });

  // rename and move the files to the /dist/ directory
  await new Promise(resolve => {
    gulp
      .src(filenames, { allowEmpty: true })
      .pipe(rename(path => {
        path.basename = setReleaseFilename(path.basename, {
          replaceWhitespace: true
        });
      }))
      .pipe(gulp.dest('./dist'))
      .on('end', resolve);
  });

  /*
  return builder.build({
    targets: builder.Platform.LINUX.createTarget(["deb", "AppImage"], builder.Arch.ia32, builder.Arch.x64),
    config
  }).then((filenames) => {
    return gulp.src(filenames, { allowEmpty: true })
      .pipe(rename(function (path) {
        path.basename = setReleaseFilename(path.basename, {
          replaceWhitespace: true
        });
      }))
      .pipe(gulp.dest('./dist'));
  }).then(() => {
    // Wait for the files to be written to disk and closed.
    return delay(10000);
  });*/
});

/** Publish the artifacts in /dist/ to GitHub */
gulp.task('publish', async () => {
  const filesToPublish = getFilesFromDist();
  await publishFiles(filesToPublish);
});

/** Returns the names of the packaged artifacts in /dist/ */
function getFilesFromDist(options = {}) {
  options = extend({}, {
    basename: packageJson.packagename,
    version: packageJson.version,
  }, options);
  const path = './dist';

  const filelist = [];
  filelist.push(`${path}/${options.basename}-${options.version}-i386.AppImage`);
  filelist.push(`${path}/${options.basename}-${options.version}-x86_64.AppImage`);
  filelist.push(`${path}/${options.basename}_${options.version}_i386.deb`);
  filelist.push(`${path}/${options.basename}_${options.version}_amd64.deb`);

  return filelist;
}
