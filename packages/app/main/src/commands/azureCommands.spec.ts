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
import { SharedConstants } from '@bfemulator/app-shared';
import { CommandRegistryImpl } from '@bfemulator/sdk-shared';
import { combineReducers, createStore } from 'redux';

import { AzureAuthWorkflowService } from '../services/azureAuthWorkflowService';
import { azureLoggedInUserChanged } from '../settingsData/actions/azureAuthActions';
import { azureAuth } from '../settingsData/reducers/azureAuthReducer';

import { registerCommands } from './azureCommands';

const mockStore = createStore(combineReducers({ azure: azureAuth }));
const mockArmToken =
  'bm90aGluZw==.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds';

jest.mock('../services/azureAuthWorkflowService', () => ({
  AzureAuthWorkflowService: {
    retrieveAuthToken: function*() {
      // eslint-disable-next-line typescript/camelcase
      yield { access_token: mockArmToken };
    },

    enterSignOutWorkflow: function*() {
      yield true;
    },
  },
}));

jest.mock('../main', () => ({
  mainWindow: {
    commandService: {
      call: () => Promise.resolve(false),
    },
  },
}));

jest.mock('../settingsData/store', () => ({
  getStore: () => mockStore,
}));

jest.mock('../emulator', () => ({
  emulator: {
    framework: {
      serverUrl: '',
    },
  },
}));

jest.mock('electron', () => ({
  app: {
    getPath: () => 'not/there',
  },
  remote: {
    app: {
      getPath: () => 'not/there',
    },
  },
  session: {
    defaultSession: {
      clearStorageData: (options, cb) => cb(true),
    },
  },
}));

describe('The azureCommand,', () => {
  let registry: CommandRegistryImpl;
  beforeAll(() => {
    registry = new CommandRegistryImpl();
    registerCommands(registry);
  });

  describe(`${SharedConstants.Commands.Azure.RetrieveArmToken}, `, () => {
    it('should retrieve the arm token and the user email address and place it in the store', async () => {
      const result = await registry
        .getCommand(SharedConstants.Commands.Azure.RetrieveArmToken)
        .handler();
      expect(result.access_token).toBe(mockArmToken);
      expect((mockStore.getState() as any).azure.signedInUser).toBe(
        'glasgow@scotland.com'
      );
    });

    it('should return false if the azure auth fails', async () => {
      AzureAuthWorkflowService.retrieveAuthToken = function*() {
        yield false;
      } as any;
      const result = await registry
        .getCommand(SharedConstants.Commands.Azure.RetrieveArmToken)
        .handler();
      expect(result).toBe(false);
    });
  });

  describe(`${SharedConstants.Commands.Azure.SignUserOutOfAzure}, `, () => {
    it('should update the store with an empty string for the signed in user when sign out is successful', async () => {
      mockStore.dispatch(azureLoggedInUserChanged('none@none.com'));
      expect((mockStore.getState() as any).azure.signedInUser).toBe(
        'none@none.com'
      );
      const result = await registry
        .getCommand(SharedConstants.Commands.Azure.SignUserOutOfAzure)
        .handler();
      expect(result).toBe(true);
      expect((mockStore.getState() as any).azure.signedInUser).toBe('');
    });
  });
});
