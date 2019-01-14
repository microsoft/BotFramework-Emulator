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
import { shallow } from 'enzyme';

import { ChatContainer } from '../parts/chat/chatContainer';

import ChatPanel from './chatPanel';

jest.mock('./chatPanel.scss', () => ({}));
jest.mock('../parts/chat/chat.scss', () => ({}));
jest.mock('../../../dialogs', () => ({
  AzureLoginPromptDialogContainer: () => ({ }),
  AzureLoginSuccessDialogContainer: () => ({ }),
  BotCreationDialog: () => ({ }),
  DialogService: { showDialog: () => Promise.resolve(true) },
  SecretPromptDialog: () => ({ })
}));

const document = {
  endpointUrl: 'my/awesome/bot',
  selectedActivity$: {
    _value: null,
    _listeners: [],
    next(newObj: any) {
      this._value = newObj;
      this._listeners.forEach(cb => cb(this._value));
    },
    subscribe(cb: any) {
      this._listeners.push(cb);

      return {
        unsubscribe: () => this._listeners = this._listeners.filter(l => l !== cb)
      };
    }
  }
};

function render() {
  const props = {
    document
  };

  // @ts-ignore - mocking out BehaviorSubject
  const component = shallow(<ChatPanel {...props} />);
  component.setProps({});
  return component;
}

describe('<ChatPanel />', () => {
  beforeEach(() => {
    document.selectedActivity$._listeners = [];
  });

  it('subscribes to selected activity changes only once', () => {
    const component = render();
    expect(document.selectedActivity$._listeners).toHaveLength(1);

    component.setProps({ document });

    expect(document.selectedActivity$._listeners).toHaveLength(1);
  });

  it('unsubscribes from the observable when unmounting', () => {
    const component = render();

    expect(document.selectedActivity$._listeners).toHaveLength(1);

    component.unmount();

    expect(document.selectedActivity$._listeners).toHaveLength(0);
  });

  describe('updating the selected actvity', () => {
    it('responds to observable changes', () => {
      const component = render();

      expect(component.state('selectedActivity')).toEqual(null);

      document.selectedActivity$.next({ new: 'activity' });

      expect(component.state('selectedActivity')).toEqual({ new: 'activity' });
    });

    it('passes and updater to the chat container', () => {
      const component = render();
      const container = component.find(ChatContainer);

      (container.prop('updateSelectedActivity') as any)({ new: 'activity' });

      expect(component.state('selectedActivity')).toEqual({
        new: 'activity',
        showInInspector: true
     });
    });
  });
});
