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

// import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';
import { WelcomePage, WelcomePageProps } from './welcomePage';
import { RootState } from '../../../data/store';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';
import { SharedConstants } from '@bfemulator/app-shared';

function mapStateToProps(state: RootState, ownProps: WelcomePageProps): WelcomePageProps {
  return {
    accessToken: state.azureAuth.access_token,
    recentBots: state.bot.botFiles,
    ...ownProps
  };
}

function mapDispatchToProps(): WelcomePageProps {
  const { Commands } = SharedConstants;
  return {
    onAnchorClick: (url) => {
      CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.OpenExternal, url).catch();
    },
    onNewBotClick: () => {
      CommandServiceImpl.call(Commands.UI.ShowBotCreationDialog).catch();
    },
    onOpenBotClick: () => {
      CommandServiceImpl.call(Commands.Bot.OpenBrowse).catch();
    },
    onBotClick: (_e: any, path: string) => {
      CommandServiceImpl.call(Commands.Bot.Switch, path).catch();
    },
    onDeleteBotClick: (_e: any, path: string) => {
      CommandServiceImpl.remoteCall(Commands.Bot.RemoveFromBotList, path).catch();
    },
    signInWithAzure: () => {
      CommandServiceImpl.call(Commands.UI.SignInToAzure).catch();
    },
    signOutWithAzure: () => {
      CommandServiceImpl.call(Commands.Azure.SignUserOutOfAzure).catch();
      CommandServiceImpl.call(Commands.UI.InvalidateAzureArmToken).catch();
    }
  };
}

// export const WelcomePage = connect(mapStateToProps, mapDispatchToProps)(hot(module)(WelcomePageComp)) as any;
export const WelcomePageContainer = connect(mapStateToProps, mapDispatchToProps)(WelcomePage);
