const { download } = require('@electron/get');
const extract = require('extract-zip');
const { join } = require('path');

const packageJson = require('../package.json');
const electronVersion = packageJson.devDependencies.electron;

async function downloadAndExtract() {
  // download the custom build of Electron
  const zipPath = await download(electronVersion, {
    mirrorOptions: {
      mirror: process.env.MSFT_ELECTRON_DIR,
      customDir: process.env.MSFT_ELECTRON_MIRROR,
    },
  });
  console.log(`Electron successfully downloaded to ${zipPath}`);

  // extract the custom build into a local directory
  const extractPath = join(__dirname, '..', 'customElectron');
  await extract(zipPath, { dir: extractPath });
  console.log(`Electron successfully unzipped in ${extractPath}`);

  return extractPath;
}

downloadAndExtract()
  .then(extractPath => console.log(`Downloaded and extracted the internal Electron build to ${extractPath}`))
  .catch(err => {
    console.log(`Error downloading and extracting the internal Electron build: ${err}`);
    throw err;
  });
