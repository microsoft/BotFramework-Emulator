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
import { Component } from 'react';
import { combineReducers, createStore } from 'redux';
import { bot, resources, setShowing as setDialogShowing } from '@bfemulator/app-shared';

import { DialogService } from './dialogService';

const mockComponent = class extends Component<{}, {}> {
  public render() {
    return <div />;
  }

  componentDidMount() {
    setTimeout(() => DialogService.hideDialog(1), 50);
  }
};
const mockStore = createStore(combineReducers({ resources, bot }));
jest.mock('../../../state/store', () => ({
  get store() {
    return mockStore;
  },
}));
describe('The DialogService', () => {
  it('should resolve to null if no dialogHost element is set', async () => {
    const result = await DialogService.showDialog(mockComponent);
    expect(result).toBeNull();
  });

  it('should render the component to the host element and notify the store when "showDialog" is called', async () => {
    const hostElement = document.createElement('div');
    const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
    let renderedToElementEvent = undefined;
    hostElement.addEventListener('dialogRendered', event => {
      renderedToElementEvent = event;
    });
    DialogService.setHost(hostElement);
    const result = await DialogService.showDialog(mockComponent);
    expect(renderedToElementEvent).not.toBeUndefined();
    expect(result).toBe(1);
    expect(dispatchSpy).toHaveBeenCalledWith(setDialogShowing(true));
  });
});
