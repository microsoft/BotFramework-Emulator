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

// We need to skip Webpack bundler on bundling 'electron':
// 1. We are using react-scripts, thus, we are not able to configure Webpack
// 2. To skip bundling, we can hack with window['require']
// 3. We cannot make a helper function to simplify the spaghetti code on require(),
// because TypeScript would complain it cannot statically extract it
const remote: Electron.Remote = (typeof window === 'undefined'
  ? require('electron')
  : (window as any).require('electron')
).remote;

export function getGlobal(attributeName: string, defaultValue?: any): any {
  if (global[attributeName]) {
    return global[attributeName];
  } else if (remote && remote.getGlobal(attributeName)) {
    return remote.getGlobal(attributeName);
  } else {
    return defaultValue;
  }
}

export function setGlobal(attributeName: string, value: any): void {
  global[attributeName] = value;
}

export function deleteGlobal(attributeName: string): void {
  delete global[attributeName];
}
