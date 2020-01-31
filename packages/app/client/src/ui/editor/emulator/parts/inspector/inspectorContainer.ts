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
import { executeCommand, setHighlightedObjects, setInspectorObjects, SharedConstants } from '@bfemulator/app-shared';
import { Activity } from 'botframework-schema';

import { RootState } from '../../../../../state/store';
import { ariaAlertService } from '../../../../a11y';

import { Inspector, InspectorProps } from './inspector';

const mapStateToProps = (state: RootState, ownProps: InspectorProps): InspectorProps => {
  const { bot, theme, clientAwareSettings } = state;
  return {
    ...ownProps,
    activeBot: bot.activeBot,
    appPath: clientAwareSettings.appPath,
    botHash: bot.activeBotDigest,
    document: state.chat.chats[ownProps.documentId],
    themeInfo: theme,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    createAriaAlert: (msg: string) => {
      ariaAlertService.alert(msg);
    },
    onAnchorClick: (url: string) => {
      dispatch(executeCommand(true, SharedConstants.Commands.Electron.OpenExternal, null, url));
    },
    trackEvent: (name: string, properties?: { [key: string]: any }) => {
      dispatch(executeCommand(true, SharedConstants.Commands.Telemetry.TrackEvent, null, name, properties));
    },
    setHighlightedObjects: (documentId: string, objects: Activity[]) =>
      dispatch(setHighlightedObjects(documentId, objects)),
    setInspectorObjects: (documentId: string, inspectorObjects: Activity[]) =>
      dispatch(setInspectorObjects(documentId, inspectorObjects)),
  };
};

export const InspectorContainer = connect(mapStateToProps, mapDispatchToProps)(Inspector);
