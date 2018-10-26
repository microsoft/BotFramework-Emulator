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

import * as winreg from 'winreg';

export function deleteKey(hive: string, path: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    try {
      let regKey = new winreg({ hive: hive, key: path });
      regKey.keyExists((err, result) => {
        if (!err && result) {
          regKey.destroy((destroyErr) => {
            if (destroyErr) {
              reject(destroyErr);
            } else {
              resolve(true);
            }
          });
        }
        resolve(true);
      });
    } catch (err) {
      reject(err);
    }
  }).then(undefined, err => {
    return undefined;
  });
}

export function createKey(hive: string, path: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    try {
      let regKey = new winreg({ hive: hive, key: path });
      regKey.keyExists((err, result) => {
        if (err || !result) {
          regKey.create((err1) => {
            if (err1) {
              reject(err1);
            } else {
              resolve(true);
            }
          });
        }
        resolve(true);
      });
    } catch (err) {
      reject(err);
    }
  }).then(undefined, err => {
    return false;
  });
}

export function setStringValue(hive: string, path: string, name: string, value: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    try {
      let regKey = new winreg({ hive: hive, key: path });
      regKey.set(name, winreg.REG_SZ, value, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    } catch (err) {
      reject(err);
    }
  }).then(undefined, err => {
    return false;
  });
}

// Add registry entries for the scheme:// URI handler
export function registerProtocolHandler(scheme: string, name: string): Promise<boolean> {
  // Add registry entries for the ${scheme}:// URI handler
  return deleteKey(winreg.HKCU, `\\SOFTWARE\\Classes\\${scheme}`).then(_ => {
    return createKey(winreg.HKCU, `\\SOFTWARE\\Classes\\${scheme}`);
  }).then(_ => {
    return setStringValue(winreg.HKCU, `\\SOFTWARE\\Classes\\${scheme}`, '', `URL:${name}`);
  }).then(_ => {
    return setStringValue(winreg.HKCU, `\\SOFTWARE\\Classes\\${scheme}`, 'URL Protocol', '');
  }).then(_ => {
    return createKey(winreg.HKCU, `\\SOFTWARE\\Classes\\${scheme}\\DefaultIcon`);
  }).then(_ => {
    return setStringValue(winreg.HKCU, `\\SOFTWARE\\Classes\\${scheme}\\DefaultIcon`, '', process.execPath + ',1');
  }).then(_ => {
    return createKey(winreg.HKCU, `\\SOFTWARE\\Classes\\${scheme}\\shell`);
  }).then(_ => {
    return createKey(winreg.HKCU, `\\SOFTWARE\\Classes\\${scheme}\\shell\\open`);
  }).then(_ => {
    return createKey(winreg.HKCU, `\\SOFTWARE\\Classes\\${scheme}\\shell\\open\\command`);
  }).then(_ => {
    return setStringValue(winreg.HKCU, `\\SOFTWARE\\Classes\\${scheme}\\shell\\open\\command`, '',
      '"' + process.execPath + '" "%1"');
  });
}

export function unregisterProtocolHandler(scheme: string): Promise<boolean> {
  return deleteKey(winreg.HKCU, `\\SOFTWARE\\Classes\\${scheme}`);
}
