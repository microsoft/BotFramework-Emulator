const packageJson = require('./package.json');

/** Gets an environment variable with the provided name */
function getEnvironmentVar(name, defaultValue = undefined) {
  return (process.env[name] === undefined) ? defaultValue : process.env[name]
}

/** Returns the Electron Mirror URL from where electron is downloaded */
function getElectronMirrorUrl() {
  return `${getEnvironmentVar("ELECTRON_MIRROR", defaultElectronMirror)}${getEnvironmentVar("ELECTRON_VERSION", defaultElectronVersion)}`;
}

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

module.exports = {
  getEnvironmentVar,
  getElectronMirrorUrl,
  publishFiles
};
