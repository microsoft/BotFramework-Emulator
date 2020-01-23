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

import { executeCommand, SharedConstants } from '@bfemulator/app-shared';
import { connect } from 'react-redux';
import { Action } from 'redux';

import { RootState } from '../../../state/store';

import { WelcomePage, WelcomePageProps } from './welcomePage';

function mapStateToProps(state: RootState, ownProps: WelcomePageProps): WelcomePageProps {
  return {
    ...ownProps,
    debugMode: state.clientAwareSettings.debugMode,
    accessToken: state.azureAuth.access_token,
  };
}

function mapDispatchToProps(dispatch: (action: Action) => void): WelcomePageProps {
  const { Commands, Channels } = SharedConstants;
  return {
    onAnchorClick: (url: string) => {
      dispatch(executeCommand(true, SharedConstants.Commands.Electron.OpenExternal, null, url));
    },
    onNewBotClick: () =>
      new Promise(resolve => dispatch(executeCommand(false, Commands.UI.ShowBotCreationDialog, resolve))),
    showOpenBotDialog: () =>
      new Promise(resolve => dispatch(executeCommand(false, SharedConstants.Commands.UI.ShowOpenBotDialog, resolve))),
    signInWithAzure: () => new Promise(resolve => dispatch(executeCommand(false, Commands.UI.SignInToAzure, resolve))),
    signOutWithAzure: () => {
      dispatch(executeCommand(true, Commands.Azure.SignUserOutOfAzure));
      dispatch(executeCommand(false, Commands.UI.InvalidateAzureArmToken));
    },
    switchToBot: (path: string) => dispatch(executeCommand(false, Commands.Bot.Switch, null, path)),
    openBotInspectorDocs: () =>
      dispatch(executeCommand(false, Commands.UI.ShowMarkdownPage, null, Channels.ReadmeUrl, Channels.HelpLabel)),
  };
}

// export const WelcomePage = connect(mapStateToProps, mapDispatchToProps)(hot(module)(WelcomePageComp)) as any;
export const WelcomePageContainer = connect(mapStateToProps, mapDispatchToProps)(WelcomePage);
