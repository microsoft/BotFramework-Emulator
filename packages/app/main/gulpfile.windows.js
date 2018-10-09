const common = require('./gulpfile.common.js');
const gulp = require('gulp');

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

/** Creates the emulator binaries */
gulp.task('redist:binaries', async () => {
  const { getConfig, getElectronMirrorUrl } = common;
  var rename = require('gulp-rename');
  var builder = require('electron-builder');
  const config = getConfig("windows", "nsis");

  console.log(`Electron mirror: ${getElectronMirrorUrl()}`);

  // create build artifacts
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
        path.basename = setReleaseFilename(path.basename);
      }))
      .pipe(gulp.dest('./dist'))
      .on('end', resolve);
  });

  /*return builder.build({
    targets: builder.Platform.WINDOWS.createTarget(["nsis"], builder.Arch.ia32),
    config,
    prepackaged: './dist/win-ia32-unpacked'
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

/** Writes the build metadata to latest.yml  */
gulp.task('redist:metadata-only', async () => {
  const { getConfig, hashFileAsync } = common;
  const config = getConfig('windows', 'nsis');
  const releaseFilename = config.nsis.artifactName.replace('${version}', pjson.version);
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

  /*
  return Promise.all([sha512, sha2])
    .then((values) => {
      writeYamlMetadataFile(releaseFilename, 'latest.yml', './dist', values[0], releaseDate, { sha2: values[1] });
    });*/
});

/** Creates the emulator binaries and creates the metadata .yml file */
gulp.task('redist',
  gulp.series('redist:binaries', 'redist:metadata-only')
);

/** Sets the packaged artifact filename */
function setReleaseFilename(filename, options = {}) {
  const { extend } = common;
  options = extend({}, {
      lowerCase: true,
      replaceWhitespace: true,
      fixBasename: true,
      replaceName: false,
      srcName: null,
      dstName: null
    },
    options
  );
  if (options.replaceName && options.srcName && options.dstName) {
    filename = filename.replace(options.srcName, options.dstName);
  }
  if (options.lowerCase) {
    filename = filename.toLowerCase();
  }
  if (options.replaceWhitespace) {
    filename = filename.replace(/\s/g, '-');
  }
  if (options.fixBasename) {
    // renames build artifacts like 'bot-framework_{version}.*' or 'main_{version}.*'
    // to '{package name in package.json}_{version}.*'
    filename = filename.replace(/(bot[-|\s]framework)?(main)?/, packageJson.packagename);
  }
  return filename;
}

/** Writes the .yml metadata file */
function writeYamlMetadataFile(releaseFilename, yamlFilename, path, fileHash, releaseDate, extra = {}) {
  var fsp = require('fs-extra');
  var yaml = require('js-yaml');

  const ymlInfo = {
    version: pjson.version,
    releaseDate: releaseDate,
    githubArtifactName: releaseFilename,
    path: releaseFilename,
    sha512: fileHash
  };
  const obj = extend({}, ymlInfo, extra);
  const ymlStr = yaml.safeDump(obj);
  fsp.writeFileSync(`./${path}/${yamlFilename}`, ymlStr);
}
