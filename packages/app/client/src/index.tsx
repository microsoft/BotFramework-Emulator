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
// for hot reloading
import { Provider } from 'react-redux';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import interceptError from './interceptError';
import interceptHyperlink from './interceptHyperlink';
import Main from './ui/shell/mainContainer';
import { store } from './data/store';
import { CommandServiceImpl } from './platform/commands/commandServiceImpl';
import { LogService } from './platform/log/logService';
import { showWelcomePage } from './data/editorHelpers';
import { CommandRegistry, registerAllCommands } from './commands';
import { SharedConstants, newNotification } from '@bfemulator/app-shared';
import { beginAdd } from './data/action/notificationActions';
import { globalHandlers } from './utils/eventHandlers';
import 'botframework-webchat/botchat.css';
import './ui/styles/globals.scss';

interceptError();
interceptHyperlink();

CommandServiceImpl.init();
LogService.init();

registerAllCommands(CommandRegistry);

// Start rendering the UI
ReactDOM.render(
  React.createElement(Provider, { store }, React.createElement(Main as any)),
  document.getElementById('root')
);

// Tell the main process we're loaded
CommandServiceImpl.remoteCall(SharedConstants.Commands.ClientInit.Loaded)
  .then(() => {
    showWelcomePage();
    // do actions on main side that might open a document, so that they will be active over the welcome screen
    CommandServiceImpl.remoteCall(SharedConstants.Commands.ClientInit.PostWelcomeScreen);
    window.addEventListener('keydown', globalHandlers);
  })
  .catch(err => {
    const errMsg = `Error occurred while client was loading: ${err}`;
    const notification = newNotification(errMsg);
    store.dispatch(beginAdd(notification));
    window.removeEventListener('keydown', globalHandlers);
  });

if (module.hasOwnProperty('hot')) {
  (module as any).hot.accept();
}
