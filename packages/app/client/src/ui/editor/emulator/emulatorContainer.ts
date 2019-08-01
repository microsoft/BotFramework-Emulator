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
import { Notification, SharedConstants, ValueTypesMask } from '@bfemulator/app-shared';

import { RootState } from '../../../state/store';
import * as PresentationActions from '../../../state/actions/presentationActions';
import * as ChatActions from '../../../state/actions/chatActions';
import { Document } from '../../../state/reducers/editor';
import { updateDocument } from '../../../state/actions/editorActions';
import { beginAdd } from '../../../state/actions/notificationActions';
import { executeCommand } from '../../../state/actions/commandAction';
import { restartConversation } from '../../../state/actions/botActions';

import { Emulator, EmulatorProps } from './emulator';

const mapStateToProps = (state: RootState, { documentId, ...ownProps }: { documentId: string }) => ({
  activeDocumentId: state.editor.editors[state.editor.activeEditor].activeDocumentId,
  conversationId: state.chat.chats[documentId].conversationId,
  directLine: state.chat.chats[documentId].directLine,
  document: state.chat.chats[documentId],
  endpointId: state.chat.chats[documentId].endpointId,
  presentationModeEnabled: state.presentation.enabled,
  url: state.clientAwareSettings.serverUrl,
  ...ownProps,
});

const mapDispatchToProps = (dispatch): EmulatorProps => ({
  enablePresentationMode: enable =>
    enable ? dispatch(PresentationActions.enable()) : dispatch(PresentationActions.disable()),
  setInspectorObjects: (documentId, objects) => dispatch(ChatActions.setInspectorObjects(documentId, objects)),
  clearLog: (documentId: string) => {
    return new Promise(resolve => {
      dispatch(ChatActions.clearLog(documentId, resolve));
    });
  },
  restartDebugSession: (conversationId, documentId) => dispatch(restartConversation(conversationId, documentId)),
  newConversation: (documentId, options) => dispatch(ChatActions.newConversation(documentId, options)),
  updateChat: (documentId: string, updatedValues: any) => dispatch(ChatActions.updateChat(documentId, updatedValues)),
  updateDocument: (documentId, updatedValues: Partial<Document>) => dispatch(updateDocument(documentId, updatedValues)),
  createErrorNotification: (notification: Notification) => dispatch(beginAdd(notification)),
  trackEvent: (name: string, properties?: { [key: string]: any }) =>
    dispatch(executeCommand(true, SharedConstants.Commands.Telemetry.TrackEvent, null, name, properties)),
  exportItems: (valueTypes: ValueTypesMask, conversationId: string) =>
    dispatch(
      executeCommand(true, SharedConstants.Commands.Emulator.SaveTranscriptToFile, null, valueTypes, conversationId)
    ),
});

export const EmulatorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Emulator);
