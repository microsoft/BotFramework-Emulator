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
import { azureAuth, azureArmTokenDataChanged, executeCommand, SharedConstants } from '@bfemulator/app-shared';
import { ServiceTypes } from 'botframework-config/lib/schema';
import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';

import { DialogService } from '../service';

import { GetStartedWithCSDialog } from './getStartedWithCSDialog';
import { GetStartedWithCSDialogContainer } from './getStartedWithCSDialogContainer';

jest.mock('../service', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  },
}));

jest.mock('../dialogStyles.scss', () => ({}));

jest.mock('../../dialogs/', () => ({
  AzureLoginPromptDialogContainer: () => undefined,
  AzureLoginSuccessDialogContainer: () => undefined,
  BotCreationDialog: () => undefined,
  DialogService: { showDialog: () => Promise.resolve(true) },
  SecretPromptDialog: () => undefined,
}));

describe('The GetStartedWithCSDialog component should', () => {
  let mockStore;
  let mockDispatch;
  const mockArmToken = 'bm90aGluZw==.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds';
  beforeEach(() => {
    mockStore = createStore(combineReducers({ azureAuth }));
    mockDispatch = jest.spyOn(mockStore, 'dispatch');
    mockStore.dispatch(azureArmTokenDataChanged(mockArmToken));
  });

  it('should render deeply', () => {
    const parent = mount(
      <Provider store={mockStore}>
        <GetStartedWithCSDialogContainer serviceType={ServiceTypes.Luis} />
      </Provider>
    );
    expect(parent.find(GetStartedWithCSDialogContainer)).not.toEqual(null);
  });

  it('should contain both a cancel, confirm and launchConnectedServiceEditor function in the props', () => {
    const parent = mount(
      <Provider store={mockStore}>
        <GetStartedWithCSDialogContainer serviceType={ServiceTypes.Luis} />
      </Provider>
    );
    const prompt = parent.find(GetStartedWithCSDialog);
    expect(typeof (prompt.props() as any).cancel).toEqual('function');
    expect(typeof (prompt.props() as any).confirm).toEqual('function');
    expect(typeof (prompt.props() as any).launchConnectedServiceEditor).toEqual('function');
  });

  it(
    'should call DialogService.hideDialog with the appropriate values when cancel, ' +
      'confirm and launchConnectedServiceEditor are called',
    () => {
      const parent = mount(
        <Provider store={mockStore}>
          <GetStartedWithCSDialogContainer serviceType={ServiceTypes.Luis} />
        </Provider>
      );
      const spy = jest.spyOn(DialogService, 'hideDialog');
      const prompt = parent.find(GetStartedWithCSDialog);
      (prompt.props() as any).cancel();
      expect(spy).toHaveBeenLastCalledWith(0);
      (prompt.props() as any).confirm();
      expect(spy).toHaveBeenLastCalledWith(1);
      (prompt.props() as any).launchConnectedServiceEditor();
      expect(spy).toHaveBeenLastCalledWith(2);
    }
  );

  it(
    'should display luisNoModelsFoundContent when the ServiceTypes.Luis and ' +
      'showNoModelsFoundContent is provided in the props',
    () => {
      const parent: any = mount(
        <Provider store={mockStore}>
          <GetStartedWithCSDialogContainer showNoModelsFoundContent={true} serviceType={ServiceTypes.Luis} />
        </Provider>
      );
      const prompt = parent.find(GetStartedWithCSDialog);
      expect(prompt.instance().content).toEqual(prompt.instance().luisNoModelsFoundContent);
    }
  );

  it('should display luisContent when the ServiceTypes.Luis is provided in the props', () => {
    const parent: any = mount(
      <Provider store={mockStore}>
        <GetStartedWithCSDialogContainer serviceType={ServiceTypes.Luis} />
      </Provider>
    );
    const prompt = parent.find(GetStartedWithCSDialog);
    expect(prompt.instance().content).toEqual(prompt.instance().luisContent);
  });

  it('should display dispatchContent when the ServiceTypes.Dispatch is provided in the props', () => {
    const parent: any = mount(
      <Provider store={mockStore}>
        <GetStartedWithCSDialogContainer serviceType={ServiceTypes.Dispatch} />
      </Provider>
    );
    const prompt = parent.find(GetStartedWithCSDialog);
    expect(prompt.instance().content).toEqual(prompt.instance().dispatchContent);
  });

  it(
    'should display dispatchNoModelsFoundContent when the ServiceTypes.Dispatch and ' +
      'showNoModelsFoundContent is provided in the props',
    () => {
      const parent: any = mount(
        <Provider store={mockStore}>
          <GetStartedWithCSDialogContainer showNoModelsFoundContent={true} serviceType={ServiceTypes.Dispatch} />
        </Provider>
      );
      const prompt = parent.find(GetStartedWithCSDialog);
      expect(prompt.instance().content).toEqual(prompt.instance().dispatchNoModelsFoundContent);
    }
  );

  it('should display qnaContent when the ServiceTypes.QnA is provided in the props', () => {
    const parent: any = mount(
      <Provider store={mockStore}>
        <GetStartedWithCSDialogContainer serviceType={ServiceTypes.QnA} />
      </Provider>
    );
    const prompt = parent.find(GetStartedWithCSDialog);
    expect(prompt.instance().content).toEqual(prompt.instance().qnaContent);
  });

  it('should display blobContent when the ServiceTypes.BlobStorage is provided in the props', () => {
    const parent: any = mount(
      <Provider store={mockStore}>
        <GetStartedWithCSDialogContainer serviceType={ServiceTypes.BlobStorage} />
      </Provider>
    );
    const prompt = parent.find(GetStartedWithCSDialog);
    expect(prompt.instance().content).toEqual(prompt.instance().blobContent);
  });

  it('should display cosmosContent when the ServiceTypes.CosmosDB is provided in the props', () => {
    const parent: any = mount(
      <Provider store={mockStore}>
        <GetStartedWithCSDialogContainer serviceType={ServiceTypes.CosmosDB} />
      </Provider>
    );
    const prompt = parent.find(GetStartedWithCSDialog);
    expect(prompt.instance().content).toEqual(prompt.instance().cosmosDbContent);
  });

  it('should display no when no service type provided in the props', () => {
    const parent: any = mount(
      <Provider store={mockStore}>
        <GetStartedWithCSDialogContainer />
      </Provider>
    );
    const prompt = parent.find(GetStartedWithCSDialog);
    expect(prompt.instance().content).toBeNull();
  });

  it('should call the appropriate command when onAnchorClick is called', () => {
    const parent: any = mount(
      <Provider store={mockStore}>
        <GetStartedWithCSDialogContainer />
      </Provider>
    );
    const node = parent.find(GetStartedWithCSDialog);
    const instance = parent.find(GetStartedWithCSDialog).instance();
    instance.props.onAnchorClick('http://blah');
    expect(mockDispatch).toHaveBeenCalledWith(
      executeCommand(true, SharedConstants.Commands.Electron.OpenExternal, null, 'http://blah')
    );
  });
});
