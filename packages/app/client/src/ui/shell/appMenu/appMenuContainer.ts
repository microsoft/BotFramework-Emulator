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

import { connect } from 'react-redux';
import { executeCommand, rememberTheme, SharedConstants } from '@bfemulator/app-shared';

import { RootState } from '../../../state';

import { AppMenu, AppMenuProps } from './appMenu';

const {
  Commands: {
    Azure: { SignUserOutOfAzure },
    Bot,
    Electron: { CheckForUpdates, QuitAndInstall },
    UI: { InvalidateAzureArmToken, SignInToAzure },
  },
} = SharedConstants;

function mapStateToProps(state: RootState): AppMenuProps {
  const { activeEditor, editors } = state.editor;
  const { activeDocumentId } = editors[activeEditor];
  const activeDocument = editors[activeEditor].documents[activeDocumentId] || { contentType: undefined };

  return {
    activeBot: state.bot.activeBot,
    activeDocumentType: activeDocument.contentType,
    appUpdateStatus: state.update.status,
    availableThemes: state.settings.windowState.availableThemes,
    currentTheme: state.settings.windowState.theme,
    recentBots: state.bot.botFiles,
    signedInUser: state.settings.azure.signedInUser,
  };
}

function mapDispatchToProps(dispatch): AppMenuProps {
  return {
    checkForUpdates: () =>
      new Promise(resolve => {
        dispatch(executeCommand(true, CheckForUpdates, resolve));
      }),
    invalidateAzureArmToken: () =>
      new Promise(resolve => {
        dispatch(executeCommand(false, InvalidateAzureArmToken, resolve));
      }),
    openBot: (path: string) => {
      dispatch(executeCommand(false, Bot.Switch, null, path));
    },
    signUserIn: () =>
      new Promise(resolve => {
        dispatch(executeCommand(false, SignInToAzure, resolve));
      }),
    signUserOut: () =>
      new Promise(resolve => {
        dispatch(executeCommand(true, SignUserOutOfAzure, resolve));
      }),
    switchTheme: (themeName: string) => {
      dispatch(rememberTheme(themeName));
    },
    quitAndInstall: () => {
      dispatch(executeCommand(true, QuitAndInstall, null));
    },
  };
}

export const AppMenuContainer = connect(mapStateToProps, mapDispatchToProps)(AppMenu);
