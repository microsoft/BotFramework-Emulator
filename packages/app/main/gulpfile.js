const gulp = require('gulp');
const shell = require('gulp-shell');
var pjson = require('./package.json');

const defaultElectronMirror = 'https://github.com/electron/electron/releases/download/v';
const defaultElectronVersion = pjson.devDependencies["electron"];
const githubAccountName = "fuselabs";
const githubRepoName = "BotFramework-Emulator-Dev";
const appId = "F3C061A6-FE81-4548-82ED-C1171D9856BB";

//============================================================================
// BUILD
//============================================================================

//----------------------------------------------------------------------------
gulp.task('clean', function () {
  const clean = require('gulp-clean');
  return gulp.src('./app/', { read: false })
    .pipe(clean());
});

//----------------------------------------------------------------------------
gulp.task('build-app', function () {
  return gulp
    .src('./package.json', { read: false })
    .pipe(shell([
      'npm run build:electron'
    ]));
});

//----------------------------------------------------------------------------
gulp.task('build-shared', function () {
  return gulp
  .src('../shared/package.json', { read: false })
  .pipe(shell([
    'npm run build'
  ], { cwd: '../shared' }));
});

//----------------------------------------------------------------------------
gulp.task('build-react', function () {
  return gulp
    .src('../client/package.json', { read: false })
    .pipe(shell([
      'npm run build'
    ], { cwd: '../client' }));
});

//----------------------------------------------------------------------------
gulp.task('build', ['clean', 'build-shared'], function () {
  return gulp.start([
    'build-app',
    'build-react'
  ]);
});


//============================================================================
// GET-LICENSES
//============================================================================

//----------------------------------------------------------------------------
gulp.task('get-licenses', function () {
  var licenses = require('license-list');
  var source = require('vinyl-source-stream');
  const stream = source('ThirdPartyLicenses.txt');
  licenses('.', {dev: false}).then(packages => {
      const keys = Object.keys(packages).sort().filter(key => !key.startsWith(`${pjson.name}@`));
      keys.forEach(pkgId => {
          const pkgInfo = packages[pkgId];
          const formatLicense = () => {
              const formatLicenseFile = () => {
                  if (typeof pkgInfo.licenseFile === 'string') {
                      return pkgInfo.licenseFile.split(/\n/).map(line => `\t${line}`).join('\n');
                  } else {
                      return '\tLICENSE file does not exist';
                  }
              }
              return `${pkgInfo.name}@${pkgInfo.version} (${pkgInfo.license})\n\n${formatLicenseFile()}\n\n`;
          }
          stream.write(formatLicense());
      });
      stream.end();
      stream.pipe(gulp.dest('.'));
  });
});

//============================================================================
// PACKAGE
//============================================================================

//----------------------------------------------------------------------------
function hashFileAsync(filename, algo = 'sha512', encoding='base64') {
  var asarIntegrity = require('asar-integrity');
  return asarIntegrity.hashFile(filename, algo, encoding);
}

//----------------------------------------------------------------------------
function writeYamlMetadataFile(releaseFilename, yamlFilename, fileHash, releaseDate, extra = {}) {
  var fsp = require('fs-extra-p');
  var yaml = require('js-yaml');

  const ymlInfo = {
      version: pjson.version,
      releaseDate: releaseDate,
      githubArtifactName: releaseFilename,
      path: releaseFilename,
      sha512: fileHash
  };
  const obj = Object.assign({}, ymlInfo, extra);
  const ymlStr = yaml.safeDump(obj);
  fsp.writeFileSync(`./dist/${yamlFilename}`, ymlStr);
}

//----------------------------------------------------------------------------
function writeJsonMetadataFile(releaseFilename, jsonFilename, releaseDate) {
  var fsp = require('fs-extra-p');

  const jsonInfo = {
      version: pjson.version,
      releaseDate: releaseDate,
      url: `https://github.com/${githubAccountName}/${githubRepoName}/releases/v${pjson.version}/${releaseFilename}`
  };
  fsp.outputJsonSync(`./dist/${jsonFilename}`, jsonInfo, { spaces: 2 });
}

//============================================================================
// PACKAGE:WINDOWS

//----------------------------------------------------------------------------
gulp.task('package:windows:binaries', function() {
  var wait = require('gulp-wait');
  var rename = require('gulp-rename');
  var builder = require('electron-builder');
  const config = Object.assign({},
      replacePackageEnvironmentVars(require('./scripts/config/common.json')),
      replacePackageEnvironmentVars(require('./scripts/config/windows.json')));
  console.log(`Electron mirror: ${getElectronMirrorUrl()}`);
  return builder.build({
      targets: builder.Platform.WINDOWS.createTarget(["nsis", "zip"], builder.Arch.ia32, builder.Arch.x64),
      config
  }).then((filenames) => {
      return gulp.src(filenames)
          .pipe(rename(function (path) {
              path.basename = setReleaseFilename(path.basename);
          }))
          .pipe(gulp.dest('./dist'))
  }).then(() => {
      // Wait for the files to be written to disk and closed.
      return delay(10000);
  });
});

//----------------------------------------------------------------------------
gulp.task('package:windows:metadata', ['package:windows:binaries'], function() {
  const releaseFilename = `botframework-emulator-Setup-${pjson.version}.exe`;
  const sha512 = hashFileAsync(`./dist/${releaseFilename}`);
  const sha2 = hashFileAsync(`./dist/${releaseFilename}`, 'sha256', 'hex');
  const releaseDate = new Date().toISOString();

  return Promise.all([sha512, sha2])
      .then((values) => {
          writeYamlMetadataFile(releaseFilename, 'latest.yml', values[0], releaseDate, { sha2: values[1] });
      });
});

//----------------------------------------------------------------------------
gulp.task('package:windows', ['package:windows:metadata']);

//============================================================================
// PACKAGE:SQUIRREL.WINDOWS

//----------------------------------------------------------------------------
gulp.task('package:squirrel.windows', function() {
  var rename = require('gulp-rename');
  var builder = require('electron-builder');
  const config = Object.assign({},
      replacePackageEnvironmentVars(require('./scripts/config/common.json')),
      require('./scripts/config/squirrel.windows.json'));
  console.log(`Electron mirror: ${getElectronMirrorUrl()}`);
  return builder.build({
      targets: builder.Platform.WINDOWS.createTarget(["squirrel"], builder.Arch.x64),
      config
  }).then((filenames) => {
      return gulp.src(filenames)
          .pipe(rename(function (path) {
              path.basename = setReleaseFilename(path.basename, {
                  lowerCase: false,
                  replaceName: true,
                  srcName: config.productName,
                  dstName: config.squirrelWindows.name
              });
          }))
          .pipe(gulp.dest('./dist'));
  }).then(() => {
      // Wait for the files to be written to disk and closed.
      return delay(10000);
  });
});

//============================================================================
// PACKAGE:MAC

//----------------------------------------------------------------------------
gulp.task('package:mac:binaries', function() {
  var rename = require('gulp-rename');
  var builder = require('electron-builder');
  const config = Object.assign({},
      replacePackageEnvironmentVars(require('./scripts/config/common.json')),
      require('./scripts/config/mac.json'));
  console.log(`Electron mirror: ${getElectronMirrorUrl()}`);
  return builder.build({
      targets: builder.Platform.MAC.createTarget(["dmg", "zip"]),
      config
  }).then((filenames) => {
      return gulp.src(filenames)
          .pipe(rename(function (path) {
              path.basename = setReleaseFilename(path.basename);
          }))
          .pipe(gulp.dest('./dist'));
  }).then(() => {
      // Wait for the files to be written to disk and closed.
      return delay(10000);
  });
});

//----------------------------------------------------------------------------
gulp.task('package:mac:metadata', ['package:mac:binaries'], function() {
  const releaseFilename = `botframework-emulator-${pjson.version}-mac.zip`;
  const releaseHash = hashFileAsync(`./dist/${releaseFilename}`);
  const releaseDate = new Date().toISOString();

  writeJsonMetadataFile(releaseFilename, 'latest-mac.json', releaseDate);
  return releaseHash.then((hashValue) => {
      writeYamlMetadataFile(releaseFilename, 'latest-mac.yml', hashValue, releaseDate);
  });
});

//----------------------------------------------------------------------------
gulp.task('package:mac', ['package:mac:metadata']);

//============================================================================
// PACKAGE:LINUX

//----------------------------------------------------------------------------
gulp.task('package:linux', function() {
  var rename = require('gulp-rename');
  var builder = require('electron-builder');
  const config = Object.assign({},
      replacePackageEnvironmentVars(require('./scripts/config/common.json')),
      require('./scripts/config/linux.json'));
  console.log(`Electron mirror: ${getElectronMirrorUrl()}`);
  return builder.build({
      targets: builder.Platform.LINUX.createTarget(["deb", "AppImage"], builder.Arch.ia32, builder.Arch.x64),
      config
  }).then((filenames) => {
      return gulp.src(filenames)
          .pipe(rename(function (path) {
              path.basename = setReleaseFilename(path.basename);
          }))
          .pipe(gulp.dest('./dist'));
  }).then(() => {
      // Wait for the files to be written to disk and closed.
      return delay(10000);
  });
});


//============================================================================
// PUBLISH
//============================================================================

//----------------------------------------------------------------------------
function publishFiles(filelist) {
  var CancellationToken = require('electron-builder-http/out/CancellationToken').CancellationToken;
  var GitHubPublisher = require('electron-publish/out/gitHubPublisher').GitHubPublisher;
  var MultiProgress = require('electron-publish/out/multiProgress').MultiProgress;
  var publishConfig = replacePublishEnvironmentVars(require('./scripts/config/publish.json'));

  const context = {
      cancellationToken: new CancellationToken(),
      progress: new MultiProgress()
  };
  const publisher = new GitHubPublisher(
      context,
      publishConfig,
      pjson.version, {
          publish: "always",
          draft: true,
          prerelease: true
      });
  const errorlist = [];

  const uploads = filelist.map(file => {
      return publisher.upload(file)
          .catch((err) => {
              errorlist.push(err.response ? `Failed to upload ${file}, http status code ${err.response.statusCode}` : err);
              return Promise.resolve();
          });
  });

  return Promise.all(uploads)
  .then(() => errorlist.forEach((err) => console.error(err)));
}

//----------------------------------------------------------------------------
gulp.task('publish:windows', function () {
  const filelist = getFileList("windows", {
      path: './dist/'
  });
  return publishFiles(filelist);
});

//----------------------------------------------------------------------------
gulp.task('publish:squirrel.windows', function () {
  const basename = require('./scripts/config/squirrel.windows.json').squirrelWindows.name;
  const filelist = getFileList("squirrel.windows", {
      basename,
      path: './dist/'
  });
  return publishFiles(filelist);
});

//----------------------------------------------------------------------------
gulp.task('publish:mac', function () {
  const filelist = getFileList("mac", {
      path: './dist/'
  });
  return publishFiles(filelist);
});

//----------------------------------------------------------------------------
gulp.task('publish:linux', function () {
  const filelist = getFileList("linux", {
      path: './dist/'
  });
  return publishFiles(filelist);
});


//============================================================================
// UTILS
//============================================================================

//----------------------------------------------------------------------------
function getFileList(platform, options = {}) {
  options = Object.assign({}, {
      basename: pjson.name,
      version: pjson.version,
      path: './'
  }, options);
  const filelist = [];
  switch (platform) {
      case "windows":
          filelist.push(`${options.path}latest.yml`);
          filelist.push(`${options.path}${options.basename}-Setup-${options.version}.exe`);
          filelist.push(`${options.path}${options.basename}-${options.version}-win.zip`);
          filelist.push(`${options.path}${options.basename}-${options.version}-ia32-win.zip`);
      break;

      case "squirrel.windows":
          filelist.push(`${options.path}RELEASES`);
          //filelist.push(`${options.path}${options.basename}-Setup-${options.version}.exe`);
          filelist.push(`${options.path}${options.basename}-${options.version}-full.nupkg`);
      break;

      case "mac":
          filelist.push(`${options.path}latest-mac.yml`);
          filelist.push(`${options.path}latest-mac.json`);
          filelist.push(`${options.path}${options.basename}-${options.version}-mac.zip`);
          filelist.push(`${options.path}${options.basename}-${options.version}.dmg`);
      break;

      case "linux":
          filelist.push(`${options.path}${options.basename}-${options.version}-i386.AppImage`);
          filelist.push(`${options.path}${options.basename}-${options.version}-x86_64.AppImage`);
          filelist.push(`${options.path}${options.basename}_${options.version}_i386.deb`);
          filelist.push(`${options.path}${options.basename}_${options.version}_amd64.deb`);
      break;
  }
  return filelist;
}

//----------------------------------------------------------------------------
function setReleaseFilename(filename, options = {}) {
  options = Object.assign({}, {
      lowerCase: true,
      replaceWhitespace: true,
      fixBasename: true,
      replaceName: false,
      srcName: null,
      dstName: null
  },
  options);
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
      filename = filename.replace(/bot[-|\s]framework/ig, 'botframework');
  }
  return filename;
}

//----------------------------------------------------------------------------
function getEnvironmentVar(name, defaultValue = undefined)
{
  return (process.env[name] === undefined) ? defaultValue : process.env[name]
}

//----------------------------------------------------------------------------
function replaceEnvironmentVar(str, name, defaultValue = undefined) {
  let value = getEnvironmentVar(name, defaultValue);
  if (value == undefined)
      throw new Error(`Required environment variable missing: ${name}`);
  return str.replace(new RegExp('\\${' + name + '}', 'g'), value);
}

//----------------------------------------------------------------------------
function replacePackageEnvironmentVars(obj) {
  let str = JSON.stringify(obj);
  str = replaceEnvironmentVar(str, "ELECTRON_MIRROR", defaultElectronMirror);
  str = replaceEnvironmentVar(str, "ELECTRON_VERSION", defaultElectronVersion);
  str = replaceEnvironmentVar(str, "appId", appId);
  return JSON.parse(str);
}

//----------------------------------------------------------------------------
function replacePublishEnvironmentVars(obj) {
  let str = JSON.stringify(obj);
  str = replaceEnvironmentVar(str, "GITHUB_TOKEN");
  str = replaceEnvironmentVar(str, "githubAccountName", githubAccountName);
  str = replaceEnvironmentVar(str, "githubRepoName", githubRepoName);
  return JSON.parse(str);
}

//----------------------------------------------------------------------------
function getElectronMirrorUrl()
{
  return `${getEnvironmentVar("ELECTRON_MIRROR", defaultElectronMirror)}${getEnvironmentVar("ELECTRON_VERSION", defaultElectronVersion)}`;
}

//----------------------------------------------------------------------------
function delay(ms, result) {
  return new Promise((resolve, reject) => setTimeout(resolve, ms, result));
}
