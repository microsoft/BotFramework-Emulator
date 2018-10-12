const gulp = require('gulp');
const common = require('./gulpfile.common.js');
const packageJson = require('./package.json');

/** Package the emulator using electron-builder */
gulp.task('stage', async () => {
  const { getElectronMirrorUrl, getConfig } = common;
  const builder = require('electron-builder');
  const config = getConfig('mac', 'dir');

  console.log(`Electron mirror: ${getElectronMirrorUrl()}`);

  // create build artifacts
  await builder.build({
    targets: builder.Platform.MAC.createTarget(['dir']),
    config
  });
});

/** Creates the emulator installers */
gulp.task('redist:binaries', async () => {
  const { getElectronMirrorUrl, getConfig, getReleaseFilename } = common;
  const rename = require('gulp-rename');
  const builder = require('electron-builder');
  const config = getConfig('mac');

  console.log(`Electron mirror: ${getElectronMirrorUrl()}`);

  // create installers
  const filenames = await builder.build({
    targets: builder.Platform.MAC.createTarget(['zip', 'dmg']),
    config,
    prepackaged: './dist/mac'
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

/** Creates the .yml and .json metadata files */
gulp.task('redist:metadata-only', async () => {
  const { hashFileAsync, getReleaseFilename } = common;
  const releaseFilename = `${getReleaseFilename()}.zip`;
  const releaseHash = await hashFileAsync(`./dist/${releaseFilename}`);
  const releaseDate = new Date().toISOString();

  writeJsonMetadataFile(releaseFilename, 'latest-mac.json', './dist', releaseDate);
  writeYamlMetadataFile(releaseFilename, 'latest-mac.yml', './dist', releaseHash, releaseDate);
});

/** Writes the .yml metadata file */
function writeYamlMetadataFile(releaseFilename, yamlFilename, path, fileHash, releaseDate, extra = {}) {
  const { extend } = common;
  const fsp = require('fs-extra');
  const yaml = require('js-yaml');

  const ymlInfo = {
    version: packageJson.version,
    releaseDate,
    githubArtifactName: releaseFilename,
    path: releaseFilename,
    sha512: fileHash
  };
  const obj = extend({}, ymlInfo, extra);
  const ymlStr = yaml.safeDump(obj);
  fsp.writeFileSync(`./${path}/${yamlFilename}`, ymlStr);
}

/** Writes the .json metadata file */
function writeJsonMetadataFile(releaseFilename, jsonFilename, path, releaseDate) {
  const fsp = require('fs-extra');
  const { githubAccountName, githubRepoName } = common;

  const jsonInfo = {
    version: packageJson.version,
    releaseDate,
    url: `https://github.com/${githubAccountName}/${githubRepoName}/releases/v${packageJson.version}/${releaseFilename}`
  };
  fsp.outputJsonSync(`./${path}/${jsonFilename}`, jsonInfo, { spaces: 2 });
}
