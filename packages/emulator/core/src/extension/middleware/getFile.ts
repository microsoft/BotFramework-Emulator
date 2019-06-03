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
import * as path from 'path';

import * as Restify from 'restify';
import { readFile, readJSON } from 'fs-extra';
import * as mime from 'mime';

const memCache = {};

export async function getFile(req: Restify.Request, res: Restify.Response, next: Restify.Next) {
  const { extensionId } = req.params;

  const manifestFileLocation = path.resolve(path.join('./app/extensions/', extensionId, '/bf-extension.json'));

  try {
    let manifest = memCache[manifestFileLocation];
    if (!manifest) {
      manifest = memCache[manifestFileLocation] = await readJSON(manifestFileLocation);
    }
    const descriptorFileLocation = path.resolve(path.join(manifest.location, 'bf-extension.json'));

    let descriptor = memCache[descriptorFileLocation];
    if (!descriptor) {
      descriptor = memCache[descriptorFileLocation] = await readJSON(descriptorFileLocation);
    }

    const extensionRoot = path.resolve(path.join(manifest.location, descriptor.root));
    const idx = req.url.indexOf(extensionId);
    const filePathWithinRoot = req.url.substring(idx + extensionId.length);

    const mimeType = (mime as any)._types[path.extname(filePathWithinRoot).replace('.', '')];
    const fileContents = await readFile(path.join(extensionRoot, filePathWithinRoot));
    res.writeHead(200, {
      'Cache-Control': 'max-age=600', // 10 minutes
      'Content-type': `${mimeType}; charset=utf-8`,
      'Content-Length': fileContents.byteLength,
    });
    res.write(fileContents);
    res.end();
  } catch (e) {
    res.writeHead(404);
    res.end();
  }

  next();
}
