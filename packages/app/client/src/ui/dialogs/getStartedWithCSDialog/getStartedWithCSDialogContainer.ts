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
import { DialogService } from '../service';

import { GetStartedWithCSDialog, GetStartedWithCSDialogProps } from './getStartedWithCSDialog';

const mapStateToProps = (state: RootState, ownProps) => {
  const { access_token: token = '' } = state.azureAuth;
  const [, payload] = token.split('.');
  const pJson = JSON.parse(atob(payload));

  return {
    ...ownProps,
    user: pJson.upn || pJson.unique_name || pJson.name || pJson.email,
  };
};

const mapDispatchToProps = (dispatch: (action: Action) => void): GetStartedWithCSDialogProps => ({
  cancel: () => DialogService.hideDialog(0),
  confirm: () => DialogService.hideDialog(1),
  launchConnectedServiceEditor: () => {
    DialogService.hideDialog(2);
  },
  onAnchorClick: (url: string) => {
    dispatch(executeCommand(true, SharedConstants.Commands.Electron.OpenExternal, null, url));
  },
});

export const GetStartedWithCSDialogContainer = connect(mapStateToProps, mapDispatchToProps)(GetStartedWithCSDialog);
