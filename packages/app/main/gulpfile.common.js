const packageJson = require('./package.json');
const gulp = require ('gulp');

const defaultElectronMirror = 'https://github.com/electron/electron/releases/download/v';
const defaultElectronVersion = packageJson.devDependencies["electron"];
const githubAccountName = "Microsoft";
const githubRepoName = "BotFramework-Emulator";
const appId = "F3C061A6-FE81-4548-82ED-C1171D9856BB";

/** Copies extension json files into built */
gulp.task('copy-extension-stubs', function () {
  return gulp
    .src('./src/extensions/**/*')
    .pipe(gulp.dest('./app/extensions'));
});

/** Checks all files for missing GitHub copyright text and reports missing files */
gulp.task('verify:copyright', function () {
  const lernaRoot = '../../../';
  const lernaJson = require(join(lernaRoot, 'lerna.json'));
  const files = lernaJson.packages.filter(p => !/\/custom-/.test(p)).map(dir => join(lernaRoot, dir, '**/*.@(js|jsx|ts|tsx)'));
  const filesWithoutCopyright = [];
  let count = 0;
  let scanned = 0;

  return gulp
    .src(files, { buffer: false })
    .pipe(through2(
      (file, _, callback) => {
        const filename = file.history[0];

        count++;

        if (
          // TODO: Instead of using pattern, we should use .gitignore
          !/[\\\/](build|built|lib|node_modules)[\\\/]/.test(filename)
          && !file.isDirectory()
        ) {
          callback(null, file);
        } else {
          callback();
        }
      }
    ))
    .pipe(buffer())
    .pipe(through2(
      (file, _, callback) => {
        const filename = file.history[0];
        const first1000 = file.contents.toString('utf8', 0, 1000);

        if (!~first1000.indexOf('Copyright (c) Microsoft Corporation')) {
          filesWithoutCopyright.push(relative(process.cwd(), filename));
        }

        scanned++;

        callback();
      },
      callback => {
        log.info(`Verified ${chalk.magenta(scanned)} out of ${chalk.magenta(count)} files with copyright header`);

        if (filesWithoutCopyright.length) {
          log.error(chalk.red('Copyright header is missing from the following files:'));
          filesWithoutCopyright.forEach(filename => log.error(chalk.magenta(filename)));
          callback(new Error('missing copyright header'));
        } else {
          callback();
        }
      }
    ));
});

/** Gets an environment variable value with the provided name */
function getEnvironmentVar(name, defaultValue = undefined) {
  return (process.env[name] === undefined) ? defaultValue : process.env[name]
}

/** Replaces an environment variable */
function replaceEnvironmentVar(str, name, defaultValue = undefined) {
  const value = getEnvironmentVar(name, defaultValue);
  if (value === undefined)
    throw new Error(`Required environment variable missing: ${name}`);
  return str.replace(new RegExp('\\${' + name + '}', 'g'), value);
}

/** Replaces a packaging-related environment variable */
function replacePackageEnvironmentVars(obj) {
  let str = JSON.stringify(obj);
  str = replaceEnvironmentVar(str, "ELECTRON_MIRROR", defaultElectronMirror);
  str = replaceEnvironmentVar(str, "ELECTRON_VERSION", defaultElectronVersion);
  str = replaceEnvironmentVar(str, "appId", appId);
  return JSON.parse(str);
}

/** Replaces a publishing-related environment variable */
function replacePublishEnvironmentVars(obj) {
  let str = JSON.stringify(obj);
  str = replaceEnvironmentVar(str, "GH_TOKEN");
  str = replaceEnvironmentVar(str, "githubAccountName", githubAccountName);
  str = replaceEnvironmentVar(str, "githubRepoName", githubRepoName);
  return JSON.parse(str);
}

/** Returns the Electron Mirror URL from where electron is downloaded */
function getElectronMirrorUrl() {
  return `${getEnvironmentVar("ELECTRON_MIRROR", defaultElectronMirror)}${getEnvironmentVar("ELECTRON_VERSION", defaultElectronVersion)}`;
}

/** Gets the config file for a specific platform */
function getConfig(platform, target) {
  return extend({},
    replacePackageEnvironmentVars(require('./scripts/config/common.json')),
    replacePackageEnvironmentVars(require(`./scripts/config/${platform}.json`)),
    (target ? replacePackageEnvironmentVars(require(`./scripts/config/${platform}-${target}.json`)) : {})
  );
}

/** _.extend */
function extend(...sources) {
  let output = {};
  sources.forEach(source => {
    extend1(output, source);
  });
  return output;
}

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

/** Publishes files to GitHub
 * @param {string[]} filelist List of filenames to publish
*/
async function publishFiles(filelist) {
  var CancellationToken = require('electron-builder-http/out/CancellationToken').CancellationToken;
  var GitHubPublisher = require('electron-publish/out/gitHubPublisher').GitHubPublisher;
  var publishConfig = replacePublishEnvironmentVars(require('./scripts/config/publish.json'));

  const context = {
    cancellationToken: new CancellationToken(),
    progress: null
  };

  const publisher = new GitHubPublisher(
    context,
    publishConfig,
    packageJson.version, {
      publish: "always",
      draft: true,
      prerelease: false
    }
  );
  const errorlist = [];

  const uploads = filelist.map(file => {
    return publisher.upload({ file })
      .catch((err) => {
        errorlist.push(err.response ? `Failed to upload ${file}, http status code ${err.response.statusCode}` : err);
        return Promise.resolve();
      });
  });

  return await Promise.all(uploads)
    .then(() => errorlist.forEach(err => console.error(err)));
}

/** Hashes a file asynchronously */
function hashFileAsync(filename, algo = 'sha512', encoding = 'base64') {
  var builderUtil = require('builder-util');
  return builderUtil.hashFile(filename, algo, encoding);
}

module.exports = {
  extend,
  getConfig,
  getEnvironmentVar,
  getElectronMirrorUrl,
  githubAccountName,
  githubRepoName,
  hashFileAsync,
  publishFiles
};
