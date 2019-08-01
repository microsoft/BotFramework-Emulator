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
import { combineReducers, createStore, Store } from 'redux';
import { Settings } from '@bfemulator/app-shared';

import { azureLoggedInUserChanged, azurePersistLoginChanged } from '../actions/azureAuthActions';

import { azureAuthSettings } from './azureAuthSettings';

describe('The azureAuth reducer', () => {
  let store: Store<Settings>;

  beforeAll(() => {
    store = createStore(combineReducers({ azure: azureAuthSettings }));
  });

  it('should create the store with the expected defaults', () => {
    expect(JSON.stringify(store.getState().azure)).toBe(JSON.stringify({}));
  });

  it('should set the "persistLogin" value', () => {
    store.dispatch(azurePersistLoginChanged(true));
    expect(store.getState().azure.persistLogin).toBe(true);
  });

  it('should set the "signedInUser" value', () => {
    store.dispatch(azureLoggedInUserChanged('hidi-ho!@southpark.com'));
    expect(store.getState().azure.signedInUser).toBe('hidi-ho!@southpark.com');
  });
});
