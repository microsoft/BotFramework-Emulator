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
import {
  beginAdd,
  clearLog,
  disable as disablePresentationMode,
  enable as enablePresentationMode,
  executeCommand,
  restartConversation,
  setInspectorObjects,
  updateChat,
  updateDocument,
  Document,
  Notification,
  SharedConstants,
  ValueTypesMask,
  setRestartConversationStatus,
  RestartConversationStatus,
  RestartConversationOptions,
  setRestartConversationOption,
} from '@bfemulator/app-shared';

import { RootState } from '../../../state/store';

import { Emulator, EmulatorProps } from './emulator';

const mapStateToProps = (
  state: RootState,
  { documentId, ...ownProps }: { documentId: string }
): Partial<EmulatorProps> => {
  return {
    activeDocumentId: state.editor.editors[state.editor.activeEditor].activeDocumentId,
    activities: state.chat.chats[documentId].activities,
    botId: state.chat.chats[documentId].botId,
    conversationId: state.chat.chats[documentId].conversationId,
    directLine: state.chat.chats[documentId].directLine,
    documentId,
    endpointId: state.chat.chats[documentId].endpointId,
    framework: state.framework,
    presentationModeEnabled: state.presentation.enabled,
    ui: state.chat.chats[documentId].ui,
    url: state.clientAwareSettings.serverUrl,
    userId: state.chat.chats[documentId].userId,
    restartStatus: state.chat.restartStatus[documentId],
    currentRestartConversationOption: state.chat.chats[documentId].restartConversationOption,
    ...ownProps,
  };
};

const mapDispatchToProps = (dispatch): Partial<EmulatorProps> => ({
  clearLog: (documentId: string) => {
    dispatch(clearLog(documentId));
  },
  createErrorNotification: (notification: Notification) => dispatch(beginAdd(notification)),
  enablePresentationMode: (enabled: boolean) =>
    enabled ? dispatch(enablePresentationMode()) : dispatch(disablePresentationMode()),
  exportItems: (valueTypes: ValueTypesMask, conversationId: string) =>
    dispatch(
      executeCommand(true, SharedConstants.Commands.Emulator.SaveTranscriptToFile, null, valueTypes, conversationId)
    ),
  restartConversation: (documentId: string, requireNewConversationId: boolean, requireNewUserId: boolean) =>
    dispatch(restartConversation(documentId, requireNewConversationId, requireNewUserId)),
  setInspectorObjects: (documentId, objects) => dispatch(setInspectorObjects(documentId, objects)),
  trackEvent: (name: string, properties?: { [key: string]: any }) =>
    dispatch(executeCommand(true, SharedConstants.Commands.Telemetry.TrackEvent, null, name, properties)),
  updateChat: (documentId: string, updatedValues: any) => dispatch(updateChat(documentId, updatedValues)),
  updateDocument: (documentId, updatedValues: Partial<Document>) => dispatch(updateDocument(documentId, updatedValues)),
  onStopRestartConversationClick: (documentId: string) =>
    dispatch(setRestartConversationStatus(RestartConversationStatus.Rejected, documentId)),
  onSetRestartConversationOptionClick: (documentId: string, option: RestartConversationOptions) =>
    dispatch(setRestartConversationOption(documentId, option)),
});

export const EmulatorContainer = connect(mapStateToProps, mapDispatchToProps)(Emulator);
