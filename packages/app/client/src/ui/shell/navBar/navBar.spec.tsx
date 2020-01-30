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
import { mount, shallow } from 'enzyme';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { open as openEditorDocument, select, showExplorer } from '@bfemulator/app-shared';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

import * as Constants from '../../../constants';
import { BotCommands } from '../../../commands/botCommands';

import { NavBarComponent as NavBar } from './navBar';
import { NavBar as NavBarContainer } from './navBarContainer';

let mockState;
const mockNotifications = {
  id1: { read: true },
  id2: { read: true },
  id3: { read: false },
};
jest.mock('../../../notificationManager', () => ({
  NotificationManager: {
    get: id => mockNotifications[id],
  },
}));

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

describe('<NavBar/>', () => {
  let mockDispatch;
  let wrapper;
  let instance;
  let node;
  let mockRemoteCallsMade;
  let commandService: CommandServiceImpl;
  beforeAll(() => {
    new BotCommands();
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
    commandService.remoteCall = (...args) => {
      mockRemoteCallsMade.push(args);
      return true as any;
    };
  });

  beforeEach(() => {
    mockState = {
      bot: {
        activeBot: {},
      },
      notification: {
        allIds: Object.keys(mockNotifications),
      },
    };
    const mockStore = createStore((_state, _action) => mockState);
    mockDispatch = jest.spyOn(mockStore, 'dispatch');
    mockRemoteCallsMade = [];
    wrapper = mount(
      <Provider store={mockStore}>
        <NavBarContainer />
      </Provider>
    );
    node = wrapper.find(NavBar);
    instance = node.instance();
  });

  it('should render links for each section', () => {
    expect(instance).not.toBeNull();
    expect(instance.links).toHaveLength(4);
  });

  it('should render a notification badge', () => {
    const badge = shallow(instance.renderNotificationBadge('Notifications'));
    expect(badge.html()).not.toBeNull();
    expect(badge.html().includes('1')).toBe(true);
  });

  it('should select the corresponding nav section', () => {
    const parentElement: any = {
      children: ['botExplorer', 'resources', 'settings'],
    };
    const currentTarget = {
      name: 'notifications',
      parentElement,
    };
    // wedge notifications "anchor" in between "resources" and "settings"
    parentElement.children.splice(2, 0, currentTarget);
    const mockEvent = {
      currentTarget,
    };
    instance.onLinkClick(mockEvent as any);
    expect(mockDispatch).toHaveBeenCalledWith(select('navbar.notifications'));
    expect(instance.state.selection).toBe('navbar.notifications');
  });

  it('should open the app settings editor', () => {
    const parentElement: any = {
      children: ['botExplorer', 'resources', 'notifications'],
    };
    const currentTarget = {
      name: 'settings',
      parentElement,
    };
    const mockEvent = {
      currentTarget,
    };
    instance.onLinkClick(mockEvent);

    expect(mockDispatch).toHaveBeenCalledWith(
      openEditorDocument({
        contentType: Constants.CONTENT_TYPE_APP_SETTINGS,
        documentId: Constants.DOCUMENT_ID_APP_SETTINGS,
        isGlobal: true,
        meta: null,
      })
    );
  });

  it('should show / hide the explorer', () => {
    instance.props.showExplorer(true);

    expect(mockDispatch).toHaveBeenCalledWith(showExplorer(true));
  });
});
