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

import { CommandRegistryImpl } from '@bfemulator/sdk-shared';
import { SharedConstants } from '@bfemulator/app-shared';
import { combineReducers, createStore } from 'redux';

import { clientAwareSettings } from '../data/reducer/clientAwareSettingsReducer';
import { store } from '../data/store';
import { clientAwareSettingsChanged } from '../data/action/clientAwareSettingsActions';

import { registerCommands } from './settingsCommands';

const mockStore = createStore(combineReducers({ clientAwareSettings }));
jest.mock('../data/store', () => ({
  get store() {
    return mockStore;
  },
}));

describe('the settings commands', () => {
  let registry: CommandRegistryImpl;
  beforeAll(() => {
    registry = new CommandRegistryImpl();
    registerCommands(registry);
  });

  it('should dispatch to the store when settings are sent from the main side', () => {
    const command = registry.getCommand(
      SharedConstants.Commands.Settings.ReceiveGlobalSettings
    ).handler;
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    command({});
    expect(dispatchSpy).toHaveBeenCalledWith(
      clientAwareSettingsChanged({} as any)
    );
  });
});
