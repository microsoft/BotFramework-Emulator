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

import { createStore } from 'redux';
import { Provider } from 'react-redux';
import * as React from 'react';
import { mount } from 'enzyme';

import { ChatPanel } from './chatPanel';
import { ChatPanelContainer } from './chatPanelContainer';

jest.mock('../parts/chat/chatContainer', () => ({
  ChatContainer: () => <div />,
}));
jest.mock('./chatPanel.scss', () => ({}));
jest.mock('../parts/chat/chat.scss', () => ({}));
jest.mock('../../../dialogs', () => ({
  AzureLoginPromptDialogContainer: () => ({}),
  AzureLoginSuccessDialogContainer: () => ({}),
  BotCreationDialog: () => ({}),
  DialogService: { showDialog: () => Promise.resolve(true) },
  SecretPromptDialog: () => ({}),
}));

describe('<ChatPanel />', () => {
  it('should render with a chat document', () => {
    const wrapper = mount(
      <Provider
        store={createStore((state, action) => state, { chat: { chats: { doc1: { endpointUrl: 'someUrl' } } } })}
      >
        <ChatPanelContainer documentId={'doc1'} />
      </Provider>
    );
    const node = wrapper.find(ChatPanel);

    expect(node.exists()).toBe(true);
  });
  it('should render without a chat document', () => {
    const wrapper = mount(
      <Provider store={createStore((state, action) => state, { chat: { chats: {} } })}>
        <ChatPanelContainer documentId={'doc1'} />
      </Provider>
    );
    const node = wrapper.find(ChatPanel);

    expect(node.exists()).toBe(true);
  });
});
