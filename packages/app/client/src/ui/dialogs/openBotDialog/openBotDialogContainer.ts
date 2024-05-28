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

import { executeCommand, openBotViaFilePathAction, openBotViaUrlAction, SharedConstants } from '@bfemulator/app-shared';
import { connect } from 'react-redux';
import { Action } from 'redux';

import { DialogService } from '../service';
import { RootState } from '../../../state/store';

import { OpenBotDialog, OpenBotDialogProps, OpenBotDialogState } from './openBotDialog';

const mapDispatchToProps = (dispatch: (action: Action) => void): OpenBotDialogProps => {
  return {
    onAnchorClick: (url: string) => {
      dispatch(executeCommand(true, SharedConstants.Commands.Electron.OpenExternal, null, url));
    },
    openBot: (componentState: OpenBotDialogState) => {
      DialogService.hideDialog();
      const {
        appId = '',
        appPassword = '',
        tenantId = '',
        botUrl = '',
        mode = 'livechat-url',
        isAzureGov,
        randomSeed,
        randomValue,
        speechKey = '',
        speechRegion = '',
      } = componentState;
      if (botUrl.startsWith('http')) {
        dispatch(
          openBotViaUrlAction({
            appId,
            appPassword,
            tenantId,
            endpoint: botUrl,
            mode,
            channelService: isAzureGov ? 'azureusgovernment' : 'public',
            randomSeed: Number(randomSeed) || undefined,
            randomValue: Number(randomValue) || undefined,
            speechKey,
            speechRegion,
          })
        );
      } else {
        dispatch(openBotViaFilePathAction(botUrl));
      }
    },
    onDialogCancel: () => DialogService.hideDialog(),
  };
};

const mapStateToProps = (state: RootState, ownProps: OpenBotDialogProps): OpenBotDialogProps => {
  return {
    savedBotUrls: state.clientAwareSettings.savedBotUrls,
    ...ownProps,
  };
};

export const OpenBotDialogContainer = connect(mapStateToProps, mapDispatchToProps)(OpenBotDialog);
