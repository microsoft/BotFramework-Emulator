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
import { mount } from 'enzyme';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { toggleDraggingTab } from '@bfemulator/app-shared';

import { TabContainer } from './tabContainer';
import { Tab } from './tab';

jest.mock('./tab.scss', () => ({
  generic: 'generic',
  livechat: 'livechat',
  settings: 'settings',
}));
jest.mock('../../../dialogs', () => ({}));
jest.mock('electron', () => ({
  remote: {
    app: {
      isPackaged: false,
    },
  },
  ipcMain: new Proxy(
    {},
    {
      get(): any {
        return () => ({});
      },
      has() {
        return true;
      },
    }
  ),
  ipcRenderer: new Proxy(
    {},
    {
      get(): any {
        return () => ({});
      },
      has() {
        return true;
      },
    }
  ),
}));

describe('Tab', () => {
  const mockOnCloseClick = jest.fn(() => null);
  let mockStore;
  let mockDispatch;
  let wrapper;
  let node;
  let instance;

  beforeEach(() => {
    mockStore = createStore((_state, _action) => ({}));
    mockDispatch = jest.spyOn(mockStore, 'dispatch');
    wrapper = mount(
      <Provider store={mockStore}>
        <TabContainer onCloseClick={mockOnCloseClick} documentId={'someDocId'} />
      </Provider>
    );
    node = wrapper.find(Tab);
    instance = node.instance();
  });

  it('should render deeply', () => {
    expect(wrapper.find(Tab)).not.toBe(null);
  });

  it('should handle space and enter key presses to close the tab', () => {
    const mockSpaceKeyPress = { key: ' ' };
    const mockEnterKeyPress = { keyCode: 13 };
    const mockSomeOtherKeyPress = { key: 'A', keyCode: 123 };

    // simulate neither enter nor spacebar key press
    instance.onCloseButtonKeyPress(mockSomeOtherKeyPress);
    expect(mockOnCloseClick).not.toHaveBeenCalled();

    // simulate enter key press
    instance.onCloseButtonKeyPress(mockEnterKeyPress);
    expect(mockOnCloseClick).toHaveBeenCalledTimes(1);

    // simulate space key press
    instance.onCloseButtonKeyPress(mockSpaceKeyPress);
    expect(mockOnCloseClick).toHaveBeenCalledTimes(2);

    expect(mockOnCloseClick).toHaveBeenCalledWith('someDocId');
  });

  it('should handle a mouse click to close the tab', () => {
    const mockStopPropagation = jest.fn(() => null);
    const mockSomeOtherKeyPress = { stopPropagation: mockStopPropagation };

    // simulate neither enter nor spacebar key press
    instance.onCloseClick(mockSomeOtherKeyPress);
    expect(mockStopPropagation).toHaveBeenCalledTimes(1);
    expect(mockOnCloseClick).toHaveBeenCalledWith('someDocId');
  });

  it('should handle a drag start', () => {
    const mockSetData = jest.fn((...args) => null);
    const mockDragEvent = {
      dataTransfer: {
        setData: mockSetData,
      },
    };
    instance.setState({ owningEditor: 'primary' });

    instance.onDragStart(mockDragEvent);
    expect(mockSetData).toHaveBeenCalledWith(
      'application/json',
      JSON.stringify({ tabId: 'someDocId', editorKey: 'primary' })
    );
    expect(mockDispatch).toHaveBeenCalledWith(toggleDraggingTab(true));
  });

  it('should handle a drag end', () => {
    instance.onDragEnd();
    expect(mockDispatch).toHaveBeenCalledWith(toggleDraggingTab(false));
  });

  it('should handle a drag over', () => {
    const mockPreventDefault = jest.fn(() => null);
    const mockStopPropagation = jest.fn(() => null);
    const mockDragEvent = {
      preventDefault: mockPreventDefault,
      stopPropagation: mockStopPropagation,
    };
    instance.setState({ draggedOver: false });

    instance.onDragOver(mockDragEvent);

    expect(mockPreventDefault).toHaveBeenCalled();
    expect(mockStopPropagation).toHaveBeenCalled();
    expect(instance.state.draggedOver).toBe(true);
  });

  it('should handle a drag enter', () => {
    const mockPreventDefault = jest.fn(() => null);
    const mockDragEvent = { preventDefault: mockPreventDefault };

    instance.onDragEnter(mockDragEvent);

    expect(mockPreventDefault).toHaveBeenCalled();
  });

  it('should handle a drag leave', () => {
    instance.setState({ draggedOver: true });

    instance.onDragLeave();

    expect(instance.state.draggedOver).toBe(false);
  });

  it('should handle a drop', () => {
    const mockPreventDefault = jest.fn(() => null);
    const mockStopPropagation = jest.fn(() => null);
    let mockGetData = jest.fn(() => '{ "tabId": "someDocId" }');
    let mockDragEvent = {
      preventDefault: mockPreventDefault,
      stopPropagation: mockStopPropagation,
      dataTransfer: {
        getData: mockGetData,
      },
    };
    instance.setState({ draggedOver: true });

    // drop tab on same tab
    instance.onDrop(mockDragEvent);

    expect(mockPreventDefault).toHaveBeenCalled();
    expect(mockStopPropagation).toHaveBeenCalled();
    expect(instance.state.draggedOver).toBe(false);
    expect(mockDispatch).not.toHaveBeenCalled();

    // drop tab on different tab
    mockGetData = jest.fn(() => '{ "tabId": "someOtherDoc" }');
    mockDragEvent = {
      preventDefault: mockPreventDefault,
      stopPropagation: mockStopPropagation,
      dataTransfer: {
        getData: mockGetData,
      },
    };
    instance.onDrop(mockDragEvent);

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('should get an icon class', () => {
    wrapper = mount(<Tab documentId={'welcome-page'} />);
    instance = wrapper.find(Tab).instance();

    expect(instance.iconClass).toBe('generic');

    wrapper = mount(<Tab documentId={'app:settings'} />);
    instance = wrapper.find(Tab).instance();

    expect(instance.iconClass).toBe('settings');

    wrapper = mount(<Tab documentId={'some-conversation-hash'} />);
    instance = wrapper.find(Tab).instance();

    expect(instance.iconClass).toBe('livechat');
  });
});
