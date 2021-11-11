//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

const { join } = require('path');

const { download } = require('@electron/get');
const extract = require('extract-zip');

const packageJson = require('../package.json');
const electronVersion = packageJson.devDependencies.electron;

async function downloadAndExtract() {
  // download the custom build of Electron
  const zipPath = await download(electronVersion, {
    mirrorOptions: {
      mirror: process.env.MSFT_ELECTRON_MIRROR,
      customDir: process.env.MSFT_ELECTRON_DIR,
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
