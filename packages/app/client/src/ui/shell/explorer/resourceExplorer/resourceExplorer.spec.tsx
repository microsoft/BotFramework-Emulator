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
import * as React from 'react';
import { Provider } from 'react-redux';
import { mount, ReactWrapper } from 'enzyme';
import { combineReducers, createStore } from 'redux';
import { ServiceTypes } from 'botframework-config/lib/schema';
import { BotConfigWithPathImpl } from '@bfemulator/sdk-shared';
import {
  openContextMenuForResource,
  openResource,
  openResourcesSettings,
  renameResource,
  resources,
  CommandAction,
  CommandActionPayload,
  OPEN_RESOURCE_SETTINGS,
} from '@bfemulator/app-shared';

import { ResourcesSettingsContainer } from '../../../dialogs';

import { ResourceExplorerContainer } from './resourceExplorerContainer';
import { ResourceExplorer } from './resourceExplorer';

const mockStore = createStore(combineReducers({ resources }), {});
const mockClass = class {};
const originalDispatch = mockStore.dispatch.bind(mockStore);

jest.mock('../../../dialogs', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  },
  get ResourcesSettingsContainer() {
    return mockClass;
  },
}));

jest.mock('../servicePane/servicePane.scss', () => ({}));
jest.mock('./resourceExplorer.scss', () => ({}));

describe('The ServicesExplorer component should', () => {
  let parent: ReactWrapper<any, any, any>;
  let node;
  let mockChat;
  let mockTranscript;
  let mockDispatch;
  beforeEach(() => {
    mockChat = BotConfigWithPathImpl.serviceFromJSON({
      type: ServiceTypes.File,
      path: 'the/file/path/chat.chat',
      name: 'testChat',
    } as any);

    mockTranscript = BotConfigWithPathImpl.serviceFromJSON({
      type: ServiceTypes.File,
      path: 'the/file/path/transcript.transcript',
      name: 'testTranscript',
    } as any);

    mockDispatch = jest
      .spyOn(mockStore, 'dispatch')
      .mockImplementation((action: CommandAction<CommandActionPayload>) => {
        if (action.type === OPEN_RESOURCE_SETTINGS) {
          action.payload.resolver();

          return action;
        }

        return originalDispatch(action);
      });

    parent = mount(
      <Provider store={mockStore}>
        <ResourceExplorerContainer files={[mockChat, mockTranscript]} fileToRename={mockTranscript} />
      </Provider>
    );
    node = parent.find(ResourceExplorer);
  });

  it('should render deeply', () => {
    expect(parent.find(ResourceExplorerContainer)).not.toBe(null);
    expect(parent.find(ResourceExplorer)).not.toBe(null);
  });

  it('should open the chat file when a list item is clicked', () => {
    node.instance().onLinkClick({ currentTarget: { dataset: { index: 0 } } });
    expect(mockDispatch).toHaveBeenCalledWith(openResource(mockChat));
  });

  it('should open the transcript file when a list item is clicked', () => {
    node.instance().onLinkClick({ currentTarget: { dataset: { index: 1 } } });
    expect(mockDispatch).toHaveBeenCalledWith(openResource(mockTranscript));
  });

  it('should dispatch a request to open the context menu when right clicking on a list item', () => {
    const instance = node.instance();
    const mockLi = document.createElement('li');
    mockLi.setAttribute('data-index', '0');

    instance.onContextMenuOverLiElement(mockLi);
    expect(mockDispatch).toHaveBeenCalledWith(openContextMenuForResource(mockChat));
  });

  it('should dispatch to rename the resource when input is blurred', () => {
    const instance = node.instance();
    instance.setState({ modifiedFileName: 'newTestTranscript' });
    instance.onInputBlur();
    expect(mockDispatch).toHaveBeenCalledWith(renameResource({ ...mockTranscript, name: 'newTestTranscript' }));
  });

  it('should dispatch to rename the resource when the enter key is pressed while focused in an input field', () => {
    const instance = node.instance();
    instance.setState({ modifiedFileName: 'newTestTranscript' });
    instance.onInputKeyUp({ key: 'Enter' });
    expect(mockDispatch).toHaveBeenCalledWith(renameResource({ ...mockTranscript, name: 'newTestTranscript' }));
  });

  it('should open the resource when the enter key is pressed while focused on a link', () => {
    node.instance().onLinkKeyPress({
      currentTarget: { dataset: { index: 0 } },
      key: 'Enter',
    });
    expect(mockDispatch).toHaveBeenCalledWith(openResource(mockChat));
  });

  it('should open the resource settings dialog when the "Choose a different location" link is clicked', async () => {
    const instance = node.instance();
    await instance.onChooseLocationClick();

    expect(mockDispatch).toHaveBeenCalledWith(
      openResourcesSettings(ResourcesSettingsContainer, expect.any(Function) as any)
    );
  });

  it('should return the file to rename', () => {
    const instance = node.instance();
    expect(instance.fileToRename).toEqual(mockTranscript);

    instance.setState({ modifiedFileName: 'newTestTranscript' });
    expect(instance.fileToRename).toEqual({ ...mockTranscript, name: 'newTestTranscript' });
  });
});
