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
  return gulp.src('./app/', { read: false, allowEmpty: true })
    .pipe(clean());
});

//----------------------------------------------------------------------------
gulp.task('copy-extension-stubs', function () {
  return gulp
    .src('./src/extensions/**/*')
    .pipe(gulp.dest('./app/extensions'));
});

//----------------------------------------------------------------------------
gulp.task('build-qnamaker-extension', function () {
  return gulp
    .src('../../extensions/qnamaker/package.json', { read: false })
    .pipe(shell([
      'npm run build'
    ], { cwd: '../../extensions/qnamaker/' }));
});

//----------------------------------------------------------------------------
gulp.task('build-debug-extension', function () {
  return gulp
    .src('../../extensions/debug/package.json', { read: false })
    .pipe(shell([
      'npm run build'
    ], { cwd: '../../extensions/debug/' }));
});

//----------------------------------------------------------------------------
gulp.task('build-extensions',
  gulp.parallel(
    'build-qnamaker-extension',
    'build-debug-extension')
);

//----------------------------------------------------------------------------
gulp.task('build-app', gulp.parallel(
  'build-extensions',
  'copy-extension-stubs',
  function () {
    return gulp
      .src('./package.json', { read: false })
      .pipe(shell([
        'npm run build:electron'
      ]));
  }));

//----------------------------------------------------------------------------
gulp.task('build-sdk-shared', function () {
  return gulp
    .src('../../sdk/shared/package.json', { read: false })
    .pipe(shell([
      'npm run build'
    ], { cwd: '../../sdk/shared' }));
});

//----------------------------------------------------------------------------
gulp.task('build-sdk-client', function () {
  return gulp
    .src('../../sdk/client/package.json', { read: false })
    .pipe(shell([
      'npm run build'
    ], { cwd: '../../sdk/client' }));
});

//----------------------------------------------------------------------------
gulp.task('build-sdk-main', function () {
  return gulp
    .src('../../sdk/main/package.json', { read: false })
    .pipe(shell([
      'npm run build'
    ], { cwd: '../../sdk/main' }));
});

//----------------------------------------------------------------------------
gulp.task('build-sdk',
  gulp.series('build-sdk-shared',
    gulp.parallel(
      'build-sdk-client',
      'build-sdk-main'))
);

//----------------------------------------------------------------------------
gulp.task('build-shared', gulp.series('build-sdk', function () {
  return gulp
    .src('../shared/package.json', { read: false })
    .pipe(shell([
      'npm run build'
    ], { cwd: '../shared' }));
}));

//----------------------------------------------------------------------------
gulp.task('build-react', function () {
  return gulp
    .src('../client/package.json', { read: false })
    .pipe(shell([
      'npm run build'
    ], { cwd: '../client' }));
});

//----------------------------------------------------------------------------
gulp.task('build',
  gulp.series('clean', 'build-shared',
    gulp.parallel(
      'build-app',
      'build-react'))
);

//============================================================================
// GET-LICENSES
//============================================================================

//----------------------------------------------------------------------------
gulp.task('get-licenses', function () {
  var licenses = require('license-list');
  var source = require('vinyl-source-stream');
  const stream = source('ThirdPartyLicenses.txt');
  licenses('.', { dev: false }).then(packages => {
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
// Packages the application ASAR and prepares a staging folder from which the
// redistributables are built.
//============================================================================

//============================================================================
// PACKAGE:WINDOWS

//----------------------------------------------------------------------------
gulp.task('package:windows', function () {
  var builder = require('electron-builder');
  const config = getConfig("windows", "package");
  console.log(`Electron mirror: ${getElectronMirrorUrl()}`);
  return builder.build({
    targets: builder.Platform.WINDOWS.createTarget(["dir"], builder.Arch.ia32, builder.Arch.x64),
    config
  });
});

//============================================================================
// PACKAGE:MAC

//----------------------------------------------------------------------------
gulp.task('package:mac', function () {
  var builder = require('electron-builder');
  const config = getConfig("mac", "package");
  console.log(`Electron mirror: ${getElectronMirrorUrl()}`);
  return builder.build({
    targets: builder.Platform.MAC.createTarget(["dir"]),
    config
  });
});

//============================================================================
// PACKAGE:LINUX

//----------------------------------------------------------------------------
gulp.task('package:linux', function () {
  var builder = require('electron-builder');
  const config = getConfig("linux", "package");
  console.log(`Electron mirror: ${getElectronMirrorUrl()}`);
  return builder.build({
    targets: builder.Platform.LINUX.createTarget(["dir"]),
    config
  });
});

//============================================================================
// REDIST
// Builds a redistributable from the packaged application.
//============================================================================

//----------------------------------------------------------------------------
function hashFileAsync(filename, algo = 'sha512', encoding = 'base64') {
  var builderUtil = require('builder-util');
  return builderUtil.hashFile(filename, algo, encoding);
}

//----------------------------------------------------------------------------
function writeYamlMetadataFile(releaseFilename, yamlFilename, path, fileHash, releaseDate, extra = {}) {
  var fsp = require('fs-extra-p');
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

//----------------------------------------------------------------------------
function writeJsonMetadataFile(releaseFilename, jsonFilename, path, releaseDate) {
  var fsp = require('fs-extra-p');

  const jsonInfo = {
    version: pjson.version,
    releaseDate: releaseDate,
    url: `https://github.com/${githubAccountName}/${githubRepoName}/releases/v${pjson.version}/${releaseFilename}`
  };
  fsp.outputJsonSync(`./${path}/${jsonFilename}`, jsonInfo, { spaces: 2 });
}

//============================================================================
// REDIST:WINDOWS-NSIS

//----------------------------------------------------------------------------
gulp.task('redist:windows-nsis:binaries', function () {
  var wait = require('gulp-wait');
  var rename = require('gulp-rename');
  var builder = require('electron-builder');
  const config = getConfig("windows", "nsis");
  console.log(`Electron mirror: ${getElectronMirrorUrl()}`);
  return builder.build({
    targets: builder.Platform.WINDOWS.createTarget(["nsis", "zip"], builder.Arch.ia32, builder.Arch.x64),
    config,
    prepackaged: './installer/packaged/windows'
  }).then((filenames) => {
    return gulp.src(filenames, { allowEmpty: true })
      .pipe(rename(function (path) {
        path.basename = setReleaseFilename(path.basename);
      }))
      .pipe(gulp.dest(config.directories.output))
  }).then(() => {
    // Wait for the files to be written to disk and closed.
    return delay(10000);
  });
});

//----------------------------------------------------------------------------
gulp.task('redist:windows-nsis:metadata', gulp.series('redist:windows-nsis:binaries', function () {
  const config = getConfig("windows", "nsis");
  const releaseFilename = `botframework-emulator-Setup-${pjson.version}.exe`;
  const sha512 = hashFileAsync(`${config.directories.output}/${releaseFilename}`);
  const sha2 = hashFileAsync(`${config.directories.output}/${releaseFilename}`, 'sha256', 'hex');
  const releaseDate = new Date().toISOString();

  return Promise.all([sha512, sha2])
    .then((values) => {
      writeYamlMetadataFile(releaseFilename, 'latest.yml', config.directories.output, values[0], releaseDate, { sha2: values[1] });
    });
}));

//----------------------------------------------------------------------------
gulp.task('redist:windows-nsis', gulp.series('redist:windows-nsis:metadata'));

//============================================================================
// REDIST:WINDOWS-SQUIRREL

//----------------------------------------------------------------------------
gulp.task('redist:windows-squirrel', function () {
  var rename = require('gulp-rename');
  var builder = require('electron-builder');
  const config = getConfig("windows", "squirrel");
  console.log(`Electron mirror: ${getElectronMirrorUrl()}`);
  return builder.build({
    targets: builder.Platform.WINDOWS.createTarget(["squirrel"], builder.Arch.x64),
    config,
    prepackaged: './installer/packaged/windows'
  }).then((filenames) => {
    return gulp.src(filenames, { allowEmpty: true })
      .pipe(rename(function (path) {
        path.basename = setReleaseFilename(path.basename, {
          lowerCase: false,
          replaceName: true,
          srcName: config.productName,
          dstName: config.squirrelWindows.name
        });
      }))
      .pipe(gulp.dest(config.directories.output));
  }).then(() => {
    // Wait for the files to be written to disk and closed.
    return delay(10000);
  });
});

//============================================================================
// REDIST:MAC

//----------------------------------------------------------------------------
gulp.task('redist:mac:binaries', function () {
  var rename = require('gulp-rename');
  var builder = require('electron-builder');
  const config = getConfig("mac", "dmg");
  console.log(`Electron mirror: ${getElectronMirrorUrl()}`);
  return builder.build({
    targets: builder.Platform.MAC.createTarget(["dmg", "zip"]),
    config,
    prepackaged: './installer/packaged/mac'
  }).then((filenames) => {
    return gulp.src(filenames, { allowEmpty: true })
      .pipe(rename(function (path) {
        path.basename = setReleaseFilename(path.basename);
      }))
      .pipe(gulp.dest(config.directories.output));
  }).then(() => {
    // Wait for the files to be written to disk and closed.
    return delay(10000);
  });
});

//----------------------------------------------------------------------------
gulp.task('redist:mac:metadata', gulp.series('redist:mac-dmg:binaries', function () {
  const config = getConfig("mac", "dmg");
  const releaseFilename = `botframework-emulator-${pjson.version}-mac.zip`;
  const releaseHash = hashFileAsync(`./${config.directories.output}/${releaseFilename}`);
  const releaseDate = new Date().toISOString();

  writeJsonMetadataFile(releaseFilename, 'latest-mac.json', config.directories.output, releaseDate);
  return releaseHash.then((hashValue) => {
    writeYamlMetadataFile(releaseFilename, 'latest-mac.yml', config.directories.output, hashValue, releaseDate);
  });
}));

//----------------------------------------------------------------------------
gulp.task('redist:mac', gulp.series('redist:mac-dmg:metadata'));

//============================================================================
// REDIST:LINUX

//----------------------------------------------------------------------------
gulp.task('redist:linux', function () {
  var rename = require('gulp-rename');
  var builder = require('electron-builder');
  const config = getConfig("linux");
  console.log(`Electron mirror: ${getElectronMirrorUrl()}`);
  return builder.build({
    targets: builder.Platform.LINUX.createTarget(["deb", "AppImage"], builder.Arch.ia32, builder.Arch.x64),
    config,
    prepackaged: './installer/packaged/linux'
  }).then((filenames) => {
    return gulp.src(filenames, { allowEmpty: true })
      .pipe(rename(function (path) {
        path.basename = setReleaseFilename(path.basename);
      }))
      .pipe(gulp.dest(config.directories.output));
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
gulp.task('publish:windows-nsis', function () {
  const filelist = getFileList("windows", "nsis");
  return publishFiles(filelist);
});

//----------------------------------------------------------------------------
gulp.task('publish:windows-squirrel', function () {
  const basename = require('./scripts/config/windows-squirrel.json').squirrelWindows.name;
  const filelist = getFileList("windows", "squirrel", {
    basename,
  });
  return publishFiles(filelist);
});

//----------------------------------------------------------------------------
gulp.task('publish:mac-dmg', function () {
  const filelist = getFileList("mac", "dmg");
  return publishFiles(filelist);
});

//----------------------------------------------------------------------------
gulp.task('publish:linux', function () {
  const filelist = getFileList("linux");
  return publishFiles(filelist);
});


//============================================================================
// UTILS
//============================================================================

//----------------------------------------------------------------------------
function getConfig(platform, target) {
  return extend({},
    replacePackageEnvironmentVars(require('./scripts/config/common.json')),
    replacePackageEnvironmentVars(require(`./scripts/config/${platform}.json`)),
    (target ? replacePackageEnvironmentVars(require(`./scripts/config/${platform}-${target}.json`)) : {})
  );
}

//----------------------------------------------------------------------------
function getFileList(platform, target, options = {}) {
  options = extend({}, {
    basename: pjson.name,
    version: pjson.version,
  }, options);
  const config = getConfig(platform, target);
  const path = config.directories.output;
  const filelist = [];
  switch (`${target || ''}-${platform}`) {
    case "windows-nsis":
      filelist.push(`${path}/latest.yml`);
      filelist.push(`${path}/${options.basename}-Setup-${options.version}.exe`);
      filelist.push(`${path}/${options.basename}-${options.version}-win.zip`);
      filelist.push(`${path}/${options.basename}-${options.version}-ia32-win.zip`);
      break;

    case "windows-squirrel":
      filelist.push(`${path}/RELEASES`);
      //filelist.push(`${options.path}${options.basename}-Setup-${options.version}.exe`);
      filelist.push(`${path}/${options.basename}-${options.version}-full.nupkg`);
      break;

    case "mac-dmg":
      filelist.push(`${path}/latest-mac.yml`);
      filelist.push(`${path}/latest-mac.json`);
      filelist.push(`${path}/${options.basename}-${options.version}-mac.zip`);
      filelist.push(`${path}/${options.basename}-${options.version}.dmg`);
      break;

    case "linux-":
      filelist.push(`${path}/${options.basename}-${options.version}-i386.AppImage`);
      filelist.push(`${path}/${options.basename}-${options.version}-x86_64.AppImage`);
      filelist.push(`${path}/${options.basename}_${options.version}_i386.deb`);
      filelist.push(`${path}/${options.basename}_${options.version}_amd64.deb`);
      break;
  }
  return filelist;
}

//----------------------------------------------------------------------------
function setReleaseFilename(filename, options = {}) {
  options = extend({}, {
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
function getEnvironmentVar(name, defaultValue = undefined) {
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
function getElectronMirrorUrl() {
  return `${getEnvironmentVar("ELECTRON_MIRROR", defaultElectronMirror)}${getEnvironmentVar("ELECTRON_VERSION", defaultElectronVersion)}`;
}

//----------------------------------------------------------------------------
function delay(ms, result) {
  return new Promise((resolve, reject) => setTimeout(resolve, ms, result));
}

//----------------------------------------------------------------------------
function extend1(destination, source) {
  for (var property in source) {
    if (source[property] && source[property].constructor &&
      source[property].constructor === Object) {
      destination[property] = destination[property] || {};
      arguments.callee(destination[property], source[property]);
    } else {
      destination[property] = source[property];
    }
  }
  return destination;
};

//----------------------------------------------------------------------------
function extend(...sources) {
  let output = {};
  sources.forEach(source => {
    extend1(output, source);
  });
  return output;
}
