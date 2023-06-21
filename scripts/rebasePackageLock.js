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

// Copied from: https://github.com/microsoft/BotFramework-WebChat/blob/main/scripts/rebasePackageLock.mjs

'use strict';

// Usage:
//   cat package-lock.json | node rebasePackageLock.mjs https://your-project.pkgs.visualstudio.com/_packaging/your-feed/npm/registry/ > new-package-lock.json

async function readAllStdin() {
  return new Promise((resolve, reject) => {
    const bufferList = [];
    let numBytes = 0;

    process.stdin.on('close', () => {
      resolve(Buffer.concat(bufferList, numBytes));
    });

    process.stdin.on('data', buffer => {
      bufferList.push(buffer);
      numBytes += buffer.length;
    });

    process.stdin.on('error', reject);
  });
}

function rebaseV1Inline(name, dependency, baseURL) {
  const { resolved: actual, version } = dependency;
  const singleName = name.split('/').reverse()[0];

  // no actual means package version is replaced by npm audit fix
  if (actual) {
    const { href: expected } = new URL(`${name}/-/${singleName}-${version}.tgz`, 'https://registry.npmjs.org/');
    const { href: rebased } = new URL(`${name}/-/${singleName}-${version}.tgz`, baseURL);

    if (expected !== actual) {
      throw new Error(`v1: Expecting "resolved" field to be "${expected}", actual is "${actual}".`);
    }

    dependency.resolved = rebased;
  }

  rebaseV1InlineAll(dependency, baseURL);
}

function rebaseV1InlineAll({ dependencies }, baseURL) {
  for (const [name, dependency] of Object.entries(dependencies || {})) {
    rebaseV1Inline(name, dependency, baseURL);
  }
}

function rebaseV2Inline(path, dependency, baseURL) {
  const { resolved: actual, version } = dependency;
  const name = path.split('node_modules/').reverse()[0];

  const singleName = name.split('/').reverse()[0];

  const { href: expected } = new URL(`${name}/-/${singleName}-${version}.tgz`, 'https://registry.npmjs.org/');
  const { href: rebased } = new URL(`${name}/-/${singleName}-${version}.tgz`, baseURL);

  if (expected !== actual) {
    throw new Error(`v2: Expecting "resolved" field to be "${expected}", actual is "${actual}".`);
  }

  dependency.resolved = rebased;
}

function rebaseV2InlineAll(packages, baseURL) {
  for (const [path, dependency] of Object.entries(packages || {})) {
    // "path" is falsy if it is iterating the current package.
    path && rebaseV2Inline(path, dependency, baseURL);
  }
}

async function main() {
  const baseURL = process.argv[2];

  if (!baseURL) {
    throw new Error('New registry base URL must be passed as first argument.');
  }

  const packageLockJSON = JSON.parse(await readAllStdin());

  // v1
  rebaseV1InlineAll(packageLockJSON, baseURL);

  // v2
  rebaseV2InlineAll(packageLockJSON.packages, baseURL);

  const json = JSON.stringify(packageLockJSON, null, 2);

  if (~json.indexOf('://registry.npmjs.org')) {
    throw new Error('After rebase, "://registry.npmjs.org" should not be detected in the output.');
  }

  console.log(json);
}

main();
