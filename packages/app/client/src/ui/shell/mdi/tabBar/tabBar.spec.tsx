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
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { enable } from '../../../../data/action/presentationActions';
import { setActiveTab, appendTab, splitTab } from '../../../../data/action/editorActions';
import { TabBarContainer } from './tabBarContainer';
import { TabBar } from './tabBar';
import {
  CONTENT_TYPE_APP_SETTINGS,
  CONTENT_TYPE_LIVE_CHAT,
  CONTENT_TYPE_TRANSCRIPT,
  CONTENT_TYPE_WELCOME_PAGE
} from '../../../../constants';

const mockTab = class Tab extends React.Component {
  public render() {
    return <div></div>;
  }
};

jest.mock('./tabBar.scss', () => ({}));
jest.mock('../../../../data/reducer/editor', () => ({ Document: {}, Editor: {} }));
jest.mock('../../../../data/editorHelpers', () => ({
  getTabGroupForDocument: () => null,
  getOtherTabGroup: (tabGroup: string) => tabGroup === 'primary' ? 'secondary' : 'primary'
}));
jest.mock('../tab/tab', () => ({ get Tab() { return mockTab; } }));

describe('TabBar', () => {
  let wrapper;
  let node;
  let instance;
  let mockStore;
  let mockDispatch;

  beforeEach(() => {
    const defaultState = {
      bot: {
        activeBot: {
          services: [{
            id: 'someEndpointId',
            name: 'myEndpoint'
          }]
        }
      },
      chat: {
        chats: {
          doc1: { endpointId: 'someEndpointId' }
        }
      },
      editor: {
        editors: {
          primary: {
            activeDocumentId: 'doc1',
            tabOrder: ['doc1'],
            documents: {
              doc1: { contentType: 'transcript', documentId: 'doc1' }
            }
          }
        }
      }
    };
    mockStore = createStore((_state, _action) => defaultState);
    mockDispatch = jest.spyOn(mockStore, 'dispatch');
    wrapper = mount(
      <Provider store={ mockStore }>
        <TabBarContainer owningEditor={ 'primary' }/>
      </Provider>
    );
    node = wrapper.find(TabBar);
    instance = node.instance();
  });

  it('should enable presentation mode', () => {
    instance.onPresentationModeClick();

    expect(mockDispatch).toHaveBeenCalledWith(enable());
  });

  it('should load widgets', () => {
    // no widgets
    let dumbWrapper = mount(<TabBar tabOrder={ [] } documents={ {} } activeDocumentId={ '' }/>);
    let dumbNode = dumbWrapper.find(TabBar);
    let dumbInstance = dumbNode.instance() as any;
    expect(dumbInstance.widgets).toHaveLength(0);

    // split widget
    dumbWrapper = mount(<TabBar tabOrder={ [] } documents={ { doc1: {}, doc2: {} } } activeDocumentId={ '' }/>);
    dumbNode = dumbWrapper.find(TabBar);
    dumbInstance = dumbNode.instance() as any;
    expect(dumbInstance.widgets).toHaveLength(1);

    // split & presentation widgets
    dumbWrapper = mount(
      <TabBar tabOrder={ [] } 
              documents={ { doc1: { contentType: CONTENT_TYPE_LIVE_CHAT }, doc2: {} } }
              activeDocumentId={ 'doc1' }/>
    );
    dumbNode = dumbWrapper.find(TabBar);
    dumbInstance = dumbNode.instance() as any;
    expect(dumbInstance.widgets).toHaveLength(2);

    dumbWrapper = mount(
      <TabBar tabOrder={ [] } 
              documents={ { doc1: { contentType: CONTENT_TYPE_TRANSCRIPT }, doc2: {} } }
              activeDocumentId={ 'doc1' }/>
    );
    dumbNode = dumbWrapper.find(TabBar);
    dumbInstance = dumbNode.instance() as any;
    expect(dumbInstance.widgets).toHaveLength(2);
  });

  it('should load tabs', () => {
    const tabs = instance.tabs;

    expect(tabs).toHaveLength(1);
  });

  it('should handle a tab click', () => {
    instance.handleTabClick(0);

    expect(mockDispatch).toHaveBeenCalledWith(setActiveTab('doc1'));
  });

  it('should handle a key press', () => {
    const mockOtherKeyPress = { key: 'a' };
    const mockSpaceKeyPress = { key: ' ' };
    const mockEnterKeyPress = { key: 'enter' };

    // simulate neither key press
    instance.handleKeyDown(mockOtherKeyPress, 0);
    expect(mockDispatch).not.toHaveBeenCalled();

    // simulate space key press
    instance.handleKeyDown(mockSpaceKeyPress, 0);
    expect(mockDispatch).toHaveBeenCalledWith(setActiveTab('doc1'));

    // simulate enter key press
    instance.handleKeyDown(mockEnterKeyPress, 0);
    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });

  it('should handle a split click', () => {
    instance.onSplitClick();
    
    expect(mockDispatch).toHaveBeenCalledWith(splitTab('transcript', 'doc1', 'primary', 'secondary'));
  });

  it('should handle a drag enter event', () => {
    const mockPreventDefault = jest.fn(() => null);
    const mockDragEvent = { preventDefault: mockPreventDefault };

    instance.onDragEnter(mockDragEvent);
    expect(mockPreventDefault).toHaveBeenCalled();
  });

  it('should handle a drag over event', () => {
    const mockStopPropagation = jest.fn(() => null);
    const mockPreventDefault = jest.fn(() => null);
    const mockDragEvent = { preventDefault: mockPreventDefault, stopPropagation: mockStopPropagation };
    instance.setState({ draggedOver: false });

    instance.onDragOver(mockDragEvent);

    expect(mockStopPropagation).toHaveBeenCalled();
    expect(mockPreventDefault).toHaveBeenCalled();
    expect(instance.state.draggedOver).toBe(true);
  });

  it('should handle a drag leave event', () => {
    instance.setState({ draggedOver: true });

    instance.onDragLeave({});

    expect(instance.state.draggedOver).toBe(false);
  });

  it('should handle a drop event', () => {
    const mockStopPropagation = jest.fn(() => null);
    const mockPreventDefault = jest.fn(() => null);
    const mockDragEvent = {
      preventDefault: mockPreventDefault,
      stopPropagation: mockStopPropagation,
      dataTransfer: {
        getData: () => '{ "tabId": "doc2", "editorKey": "secondary" }'
      }
    };
    instance.setState({ draggedOver: true });

    instance.onDrop(mockDragEvent);

    expect(mockDispatch).toHaveBeenCalledWith(appendTab('secondary', 'primary', 'doc2'));
  });

  it('should save a ref to the scrollable tabs element', () => {
    instance.saveScrollable(':)');

    expect(instance._scrollable).toEqual(':)');
  });

  it('should push a tab element ref into the childRefs array', () => {
    const mockElement = { isTabElement: 'yes!' };
    instance.setRef(mockElement);
    
    expect(instance.childRefs.some(elem => elem === mockElement)).toBe(true);
  });

  it('should get a tab label based on the document', () => {
    let result = instance.getTabLabel({ contentType: CONTENT_TYPE_APP_SETTINGS });
    expect(result).toBe('Emulator Settings');

    result = instance.getTabLabel({ contentType: CONTENT_TYPE_WELCOME_PAGE });
    expect(result).toBe('Welcome');

    result = instance.getTabLabel({ contentType: CONTENT_TYPE_TRANSCRIPT });
    expect(result).toBe('Transcript');
    result = instance.getTabLabel({ contentType: CONTENT_TYPE_TRANSCRIPT, fileName: 'test.transcript' });
    expect(result).toBe('test.transcript');

    result = instance.getTabLabel({ contentType: CONTENT_TYPE_LIVE_CHAT, documentId: 'doc1' });
    expect(result).toBe(`Live Chat (myEndpoint)`);

    result = instance.getTabLabel({});
    expect(result).toBe('');
  });

  it('should respond trigger keyboard listeners', () => {
    const map: any = {};
    window.addEventListener = jest.fn((event, cb) => {
      map[event] = cb;
    });
    const closeTabSpy = jest.fn();

    mount(
      <TabBar tabOrder={ [] } documents={ {} } activeDocumentId={ '1234' } closeTab={closeTabSpy}/>
    );

    map.keydown({key: 'w', metaKey: true, preventDefault: () => { return; }});
    expect(closeTabSpy).toHaveBeenCalledWith('1234');
    jest.clearAllMocks();
  });
});
