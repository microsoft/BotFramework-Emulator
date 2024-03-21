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
// ------------------------------------------------------------------
// Proxy support

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodeFetch = require('node-fetch');

const ROOT_PATH = '';

const caPath = process.env.HTTPS_PROXY_CA && path.resolve(ROOT_PATH, process.env.HTTPS_PROXY_CA);
// eslint-disable-next-line security/detect-non-literal-fs-filename
const ca = caPath && fs.readFileSync(caPath);

// fetch is used globally by importing the module
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare function fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
(global as any).fetch = function(...args: any[]) {
  const [urlOrRequest, requestInit = {}] = args;

  // No Proxy

  if (!process.env.HTTPS_PROXY) {
    return nodeFetch(...args);
  }

  const url: URL = new URL(typeof urlOrRequest === 'string' ? urlOrRequest : urlOrRequest.url);

  // Reference: https://www.gnu.org/software/emacs/manual/html_node/url/Proxies.html
  const noProxyList = (process.env.NO_PROXY || '')
    .split(',')
    .map(x =>
      x
        .trim()
        .toLowerCase()
        .replace(/^\*/, '')
    )
    .filter(x => x)
    .map(name => ({
      name,
      isDomain: name.startsWith('.'),
    }));

  if (noProxyList.some(x => (x.isDomain ? url.hostname.endsWith(x.name) : url.hostname === x.name))) {
    return nodeFetch(...args);
  }

  // URL is first param attach the proxy
  // to the RequestInit
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const HttpsProxyAgent = require('https-proxy-agent');
  const agent = new HttpsProxyAgent(process.env.HTTPS_PROXY, { ca });
  if (typeof urlOrRequest === 'string') {
    requestInit.agent = agent;
  } else {
    urlOrRequest.agent = agent;
  }
  return nodeFetch(urlOrRequest, requestInit);
};
