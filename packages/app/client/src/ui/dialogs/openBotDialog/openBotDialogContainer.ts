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

import { newNotification } from '@bfemulator/app-shared';
import { uniqueId } from '@bfemulator/sdk-shared';
import { connect } from 'react-redux';
import { Action } from 'redux';

import { beginAdd } from '../../../data/action/notificationActions';
import { RootState } from '../../../data/store';
import { ActiveBotHelper } from '../../helpers/activeBotHelper';
import { DialogService } from '../service';

import {
  OpenBotDialog,
  OpenBotDialogProps,
  OpenBotDialogState,
} from './openBotDialog';

const mapStateToProps = (state: RootState) => {
  return {
    openBot: async (componentState: OpenBotDialogState) => {
      DialogService.hideDialog();
      const { appId = '', appPassword = '', botUrl = '' } = componentState;
      if (botUrl.startsWith('http')) {
        const { serverUrl, users } = state.clientAwareSettings;
        const result = await fetch(
          serverUrl +
            `/v3/conversations?botEndpoint=${botUrl}&msaAppId=${appId}&msaPassword=${appPassword}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bot: {
                id: uniqueId(),
                name: 'Bot',
                role: 'bot',
              },
              members: [users.usersById[users.currentUserId]],
            }),
          }
        );
        if (result.ok) {
          return result.text();
        }
        throw new Error(
          `Failed to create a new conversation: ${result.statusText}`
        );
      }
      return ActiveBotHelper.confirmAndOpenBotFromFile(botUrl);
    },
  };
};

const mapDispatchToProps = (
  dispatch: (action: Action) => void
): OpenBotDialogProps => {
  return {
    onDialogCancel: () => DialogService.hideDialog(),
    sendNotification: (error: Error) =>
      dispatch(
        beginAdd(
          newNotification(`An Error occurred on the Open Bot Dialog: ${error}`)
        )
      ),
  };
};

export const OpenBotDialogContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(OpenBotDialog);
