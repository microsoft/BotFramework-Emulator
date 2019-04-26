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

import { newNotification, SharedConstants } from '@bfemulator/app-shared';
import { connect } from 'react-redux';
import { Action } from 'redux';

import { beginAdd } from '../../../data/action/notificationActions';
import { RootState } from '../../../data/store';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';

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
    onNewBotClick: () => {
      CommandServiceImpl.call(Commands.UI.ShowBotCreationDialog).catch();
    },
    showOpenBotDialog: (): Promise<any> => CommandServiceImpl.call(SharedConstants.Commands.UI.ShowOpenBotDialog),
    sendNotification: (error: Error) =>
      dispatch(beginAdd(newNotification(`An Error occurred on the Welcome page: ${error}`))),
    signInWithAzure: () => {
      CommandServiceImpl.call(Commands.UI.SignInToAzure).catch();
    },
    signOutWithAzure: () => {
      CommandServiceImpl.remoteCall(Commands.Azure.SignUserOutOfAzure).catch();
      CommandServiceImpl.call(Commands.UI.InvalidateAzureArmToken).catch();
    },
    switchToBot: (path: string) => CommandServiceImpl.call(Commands.Bot.Switch, path),
    openBotInspectorDocs: () =>
      CommandServiceImpl.call(Commands.UI.ShowMarkdownPage, Channels.ReadmeUrl, Channels.HelpLabel),
  };
}

// export const WelcomePage = connect(mapStateToProps, mapDispatchToProps)(hot(module)(WelcomePageComp)) as any;
export const WelcomePageContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(WelcomePage);
