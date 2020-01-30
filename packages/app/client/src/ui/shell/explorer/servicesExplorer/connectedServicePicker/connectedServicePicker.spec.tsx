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

import { bot, executeCommand, load, setActive, SharedConstants } from '@bfemulator/app-shared';
import { ServiceTypes } from 'botframework-config/lib/schema';
import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';

import { DialogService } from '../../../../dialogs/service';

import { ConnectedServicePicker } from './connectedServicePicker';
import { ConnectedServicePickerContainer } from './connectedServicePickerContainer';

jest.mock('./connectedServicePicker.scss', () => ({}));
jest.mock('../../../../dialogs/service', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  },
}));

jest.mock('../../../../dialogs/', () => ({
  AzureLoginPromptDialogContainer: () => undefined,
  AzureLoginSuccessDialogContainer: () => undefined,
  BotCreationDialog: () => undefined,
  DialogService: { showDialog: () => Promise.resolve(true) },
  SecretPromptDialog: () => undefined,
}));

describe('The ConnectedServicePicker component', () => {
  let parent;
  let node;
  let mockStore;
  let mockBot;
  let mockDispatch;
  let mockService;
  beforeEach(() => {
    mockStore = createStore(combineReducers({ bot }));
    mockDispatch = jest.spyOn(mockStore, 'dispatch');
    mockBot = JSON.parse(`{
        "name": "TestBot",
        "description": "",
        "padlock": "",
        "services": [{
            "type": "luis",
            "name": "https://testbot.botframework.com/api/messagesv3",
            "id": "https://testbot.botframework.com/api/messagesv3",
            "appId": "51fc2648-1190-44fa-9559-87b11b1d0014",
            "appPassword": "jxZjGcOpyfM4q75vp2paNQd",
            "endpoint": "https://testbot.botframework.com/api/messagesv3"
        }]
      }`);

    mockStore.dispatch(load([mockBot]));
    mockStore.dispatch(setActive(mockBot));
    mockService = { ...mockBot.services[0] };
    mockService.id = 'mock';

    parent = mount(
      <Provider store={mockStore}>
        <ConnectedServicePickerContainer availableServices={[mockService]} authenticatedUser="bot@bot.com" />
      </Provider>
    );
    node = parent.find(ConnectedServicePicker);
  });

  it('should render deeply', () => {
    expect(parent.find(ConnectedServicePickerContainer)).not.toBe(null);
    expect(parent.find(ConnectedServicePicker)).not.toBe(null);
  });

  it('should contain the expected functions in the props', () => {
    expect(typeof (node.props() as any).cancel).toBe('function');
    expect(typeof (node.props() as any).launchServiceEditor).toBe('function');
    expect(typeof (node.props() as any).connectServices).toBe('function');
  });

  it('should update the state when a checkbox is clicked', () => {
    const instance = node.instance();
    expect(instance.state.mock).toBe(false);
    instance.onChange({ target: { dataset: { index: 0 } } } as any);
    expect(instance.state.mock).not.toBeUndefined();
    expect(instance.state.checkAllChecked).toBeTruthy();
  });

  it('should update the state when the check all checkbox is checked', () => {
    const instance = node.instance();
    expect(instance.state.mock).toBe(false);
    expect(instance.state.checkAllChecked).toBeFalsy();

    instance.onSelectAllChange(null);
    expect(instance.state.mock).not.toBeUndefined();
    expect(instance.state.checkAllChecked).toBeTruthy();
  });

  it('should exit with a response of 0 when cancel or close is clicked', () => {
    const spy = jest.spyOn(DialogService, 'hideDialog');
    const instance = node.instance();
    instance.props.cancel();

    expect(spy).toHaveBeenCalledWith(0);
  });

  it('should exit with a response of 1 when adding a model manually', () => {
    const spy = jest.spyOn(DialogService, 'hideDialog');
    const instance = node.instance();
    instance.props.launchServiceEditor();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('should exit with the list of models to add when the user clicks "add"', () => {
    const spy = jest.spyOn(DialogService, 'hideDialog');
    const instance = node.instance();
    instance.state.mock = mockService;
    instance.onAddClick(null);

    expect(spy).toHaveBeenCalledWith([mockService]);
  });

  it('should disable the "Add" button when no models have been selected', () => {
    const instance = node.instance();
    expect(instance.addButtonEnabled).toBeFalsy();
  });

  describe('getDerivedStateFromProps', () => {
    it('should update the state correctly when both connected and available services exist', () => {
      const state = ConnectedServicePicker.getDerivedStateFromProps(
        {
          connectedServices: [{ id: 'testId777' }],
          availableServices: [{ id: 'testId123' }],
        } as any,
        {
          testId777: 'connected',
        } as any
      );
      expect(state.testId123).toBe(false);
    });
  });

  describe('should render the expected content when', () => {
    it('ServiceTypes.Luis is passed into the props', () => {
      parent = mount(
        <Provider store={mockStore}>
          <ConnectedServicePickerContainer
            availableServices={[mockService]}
            authenticatedUser="bot@bot.com"
            serviceType={ServiceTypes.Luis}
          />
        </Provider>
      );
      node = parent.find(ConnectedServicePicker);

      expect(node.headerElements).toBe(node.luisServiceHeader);
      expect(node.contentElements).toBe(node.luisServiceContent);
    });

    it('ServiceTypes.Dispatch is passed into the props', () => {
      parent = mount(
        <Provider store={mockStore}>
          <ConnectedServicePickerContainer
            availableServices={[mockService]}
            authenticatedUser="bot@bot.com"
            serviceType={ServiceTypes.Dispatch}
          />
        </Provider>
      );
      node = parent.find(ConnectedServicePicker);

      expect(node.headerElements).toBe(node.dispatchServiceHeader);
      expect(node.contentElements).toBe(node.dispatchServiceContent);
    });

    it('ServiceTypes.QnA is passed into the props', () => {
      parent = mount(
        <Provider store={mockStore}>
          <ConnectedServicePickerContainer
            availableServices={[mockService]}
            authenticatedUser="bot@bot.com"
            serviceType={ServiceTypes.QnA}
          />
        </Provider>
      );
      node = parent.find(ConnectedServicePicker);

      expect(node.headerElements).toBe(node.qnaServiceHeader);
      expect(node.contentElements).toBe(node.qnaServiceContent);
    });

    it('ServiceTypes.BlobStorage is passed into the props', () => {
      parent = mount(
        <Provider store={mockStore}>
          <ConnectedServicePickerContainer
            availableServices={[mockService]}
            authenticatedUser="bot@bot.com"
            serviceType={ServiceTypes.BlobStorage}
          />
        </Provider>
      );
      node = parent.find(ConnectedServicePicker);

      expect(node.headerElements).toBe(node.blobStorageHeader);
      expect(node.contentElements).toBe(node.blobStorageServiceContent);
    });

    it('ServiceTypes.AppInsights is passed into the props', () => {
      parent = mount(
        <Provider store={mockStore}>
          <ConnectedServicePickerContainer
            availableServices={[mockService]}
            authenticatedUser="bot@bot.com"
            serviceType={ServiceTypes.AppInsights}
          />
        </Provider>
      );
      node = parent.find(ConnectedServicePicker);

      expect(node.headerElements).toBe(node.appInsightsHeader);
      expect(node.contentElements).toBe(node.appInsightsServiceContent);
    });

    it('ServiceTypes.CosmosDB is passed into the props', () => {
      parent = mount(
        <Provider store={mockStore}>
          <ConnectedServicePickerContainer
            availableServices={[mockService]}
            authenticatedUser="bot@bot.com"
            serviceType={ServiceTypes.CosmosDB}
          />
        </Provider>
      );
      node = parent.find(ConnectedServicePicker);

      expect(node.headerElements).toBe(node.cosmosDbHeader);
      expect(node.contentElements).toBe(node.cosmosDbServiceContent);
    });
  });

  it('should call the appropriate command when onAnchorClick is called', () => {
    const instance = node.instance();
    instance.props.onAnchorClick('http://blah');
    expect(mockDispatch).toHaveBeenCalledWith(
      executeCommand(true, SharedConstants.Commands.Electron.OpenExternal, null, 'http://blah')
    );
  });
});
