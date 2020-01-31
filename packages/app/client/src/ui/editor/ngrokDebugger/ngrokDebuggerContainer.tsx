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
import { Action } from 'redux';
import { executeCommand, SharedConstants } from '@bfemulator/app-shared';

import { RootState } from '../../../state/store';

import { NgrokDebugger, NgrokDebuggerProps } from './ngrokDebugger';

const onFileSaveCb = (result: boolean) => {
  if (!result) {
    // TODO: Show error dialog here
    // eslint-disable-next-line no-console
    console.error('An error occured trying to save the file to disk');
  }
};

const mapStateToProps = (state: RootState, ownProps: {}): Partial<NgrokDebuggerProps> => {
  const {
    inspectUrl,
    errors,
    publicUrl,
    logPath,
    postmanCollectionPath,
    tunnelStatus,
    lastPingedTimestamp: lastTunnelStatusCheckTS,
    timeIntervalSinceLastPing: timeIntervalSinceLastPing,
  } = state.ngrokTunnel;

  return {
    inspectUrl,
    errors,
    publicUrl,
    logPath,
    postmanCollectionPath,
    tunnelStatus,
    lastPingedTimestamp: lastTunnelStatusCheckTS,
    timeIntervalSinceLastPing,
    ...ownProps,
  };
};

const mapDispatchToProps = (dispatch: (action: Action) => void) => ({
  onAnchorClick: (url: string) =>
    dispatch(executeCommand(true, SharedConstants.Commands.Electron.OpenExternal, null, url)),
  onPingTunnelClick: () => dispatch(executeCommand(true, SharedConstants.Commands.Ngrok.PingTunnel, null)),
  onReconnectToNgrokClick: () => dispatch(executeCommand(true, SharedConstants.Commands.Ngrok.Reconnect, null)),
  onSaveFileClick: (originalFilePath: string, dialogOptions: Electron.SaveDialogOptions) => {
    dispatch(
      executeCommand(
        true,
        SharedConstants.Commands.Electron.ShowSaveDialog,
        (newFilePath: string) => {
          dispatch(
            executeCommand(
              true,
              SharedConstants.Commands.Electron.CopyFile,
              onFileSaveCb,
              originalFilePath,
              newFilePath
            )
          );
        },
        dialogOptions
      )
    );
  },
});

export const NgrokDebuggerContainer = connect(mapStateToProps, mapDispatchToProps)(NgrokDebugger);
