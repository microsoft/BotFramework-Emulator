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
import { User } from '@bfemulator/sdk-shared';
import { Activity } from 'botframework-schema';
import { SharedConstants } from '@bfemulator/app-shared';

import {
  setHighlightedObjects,
  setInspectorObjects,
  showContextMenuForActivity,
} from '../../../../../state/actions/chatActions';
import { RootState } from '../../../../../state/store';
import { executeCommand } from '../../../../../state/actions/commandActions';

import { Chat, ChatProps } from './chat';

const mapStateToProps = (state: RootState, { documentId }): Partial<ChatProps> => {
  const currentChat = state.chat.chats[documentId];
  const currentUserId = currentChat.userId || state.clientAwareSettings.users.currentUserId;

  return {
    botId: currentChat.botId,
    conversationId: currentChat.conversationId,
    directLine: currentChat.directLine,
    mode: currentChat.mode,
    currentUser:
      state.clientAwareSettings.users.usersById[currentUserId] || ({ id: currentUserId, name: 'User' } as User),
    locale: state.clientAwareSettings.locale || 'en-us',
    webSpeechPonyfillFactory: state.chat.webSpeechFactories[documentId],
    pendingSpeechTokenRetrieval: state.chat.pendingSpeechTokenRetrieval,
    webchatStore: state.chat.webChatStores[documentId],
  };
};

const mapDispatchToProps = (dispatch, ownProps: ChatProps): Partial<ChatProps> => {
  return {
    setInspectorObject: (documentId: string, activity: Partial<Activity>) => {
      dispatch(setHighlightedObjects(documentId, []));
      dispatch(setInspectorObjects(documentId, activity));
    },
    showContextMenuForActivity: (activity: Partial<Activity>) => dispatch(showContextMenuForActivity(activity)),
    showOpenUrlDialog: async (url: string) => {
      return new Promise(resolve => {
        dispatch(executeCommand(false, SharedConstants.Commands.UI.ShowOpenUrlDialog, resolve, url));
      });
    },
    ...ownProps,
  };
};

export const ChatContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Chat);
