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

const packageJson = require('../../package.json');
const electronVersion = packageJson.devDependencies.electron;

const baseConfig = {
  asar: true,
  appId: 'F3C061A6-FE81-4548-82ED-C1171D9856BB',
  productName: 'Bot Framework Emulator',
  copyright: 'Copyright © 2018 Microsoft Corporation',
  protocols: [
    {
      name: 'Bot Framework Emulator',
      role: 'Viewer',
      schemes: ['bfemulator'],
    },
  ],
  fileAssociations: [
    {
      name: 'Bot',
      ext: 'bot',
    },
    {
      name: 'Transcript',
      ext: 'transcript',
    },
  ],
  asarUnpack: ['app/extensions/**', 'node_modules/@bfemulator/extension-*/**'],
  directories: {
    buildResources: './scripts/config/resources',
  },
  files: [
    '**/*',
    '!**/node_modules/*/{README.md,README,readme.md,readme,test}',
    '!**/node_modules/.bin',
    '!**/*.{o,hprof,orig,pyc,pyo,rbc}',
    '!**/._*',
    '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,__pycache__,thumbs.db,.gitignore,.gitattributes,.editorconfig,.idea,appveyor.yml,.travis.yml,circle.yml,.babelrc,.eslintignore,.eslintrc.js,.prettierrc,.eslintrc.react.js,.node-version}',
    '!.vscode${/*}',
    '!doc${/*}',
    '!**/{tsconfig.json,README.md,getlicenses.cmd}',
    '!**/node_modules/@types',
    '!./scripts',
    '!**/cache',
    '!./installer',
  ],
  win: {
    artifactName: 'BotFramework-Emulator-${version}-windows-setup.${ext}',
    icon: './scripts/config/resources/icon.ico',
    target: [
      {
        target: 'nsis',
        arch: ['ia32'],
      },
    ],
  },
  nsis: {
    include: './scripts/config/resources/nsis/installer.nsh',
    perMachine: false,
    allowElevation: true,
    allowToChangeInstallationDirectory: true,
    packElevateHelper: true,
    unicode: true,
    runAfterFinish: true,
    installerHeader: './scripts/config/resources/nsis/installerHeader.bmp',
    installerIcon: './scripts/config/resources/icon.ico',
    installerSidebar: './scripts/config/resources/nsis/installerSidebar.bmp',
    uninstallerIcon: './scripts/config/resources/icon.ico',
    uninstallerSidebar: './scripts/config/resources/nsis/installerSidebar.bmp',
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Bot Framework Emulator (V4)',
    oneClick: false,
  },
  mac: {
    artifactName: 'BotFramework-Emulator-${version}-mac.${ext}',
    category: 'public.app-category.developer-tools',
    target: [
      {
        target: 'dmg',
        arch: ['x64'],
      },
    ],
    extendInfo: {
      NSMicrophoneUsageDescription: 'This app requires microphone access to record audio.',
    },
    entitlements: './scripts/config/resources/entitlements.plist',
  },
  dmg: {
    background: './scripts/config/resources/background.tiff',
    icon: './scripts/config/resources/emulator_dmg.icns',
    title: 'Bot Framework Emulator Installer',
    contents: [
      {
        x: 140,
        y: 244,
      },
      {
        x: 380,
        y: 244,
        type: 'link',
        path: '/Applications',
      },
    ],
  },
  linux: {
    artifactName: 'BotFramework-Emulator-${version}-${platform}-${arch}.${ext}',
    category: 'Development',
    target: [
      {
        target: 'AppImage',
        arch: ['x64'],
      },
    ],
  },
  publish: null,
  remoteBuild: false,
};

module.exports = () => {
  if (process.platform === 'win32') {
    // on Windows we need to manually download the internal Electron binary
    // and then unsign it before packing it up to be signed
    return {
      ...baseConfig,
      electronDist: 'customElectron',
    };
  } else {
    // on Mac and Linux we will download the internal Electron binary as-is
    // during the electron-builder pack call
    return {
      ...baseConfig,
      electronDownload: {
        version: electronVersion,
      },
    };
  }
};
