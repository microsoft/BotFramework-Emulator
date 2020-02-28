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

import { remote } from 'electron';
import { Provider } from 'react-redux';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';

import './commands';
import interceptError from './interceptError';
import interceptHyperlink from './interceptHyperlink';
import Main from './ui/shell/mainContainer';
import { store } from './state/store';
import './ui/styles/globals.scss';

interceptError();
interceptHyperlink();

if (!remote.app.isPackaged) {
  // enable react & react-redux dev tools
  installExtension([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS])
    /* eslint-disable no-console */
    .then(installed => console.log('Successfully installed: ', installed.join(', ')))
    .catch(err => console.error('Failed to install dev tools: ', err));
  /* eslint-enable no-console */
}

// Start rendering the UI
ReactDOM.render(
  React.createElement(Provider, { store }, React.createElement(Main as any)),
  document.getElementById('root')
);

if (module.hasOwnProperty('hot')) {
  (module as any).hot.accept();
}
