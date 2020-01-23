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

//TODO: More UI tests to be added
import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { TunnelStatus, TunnelCheckTimeInterval } from '@bfemulator/app-shared';

import { NgrokStatusIndicator } from './ngrokStatusIndicator';

describe('Ngrok Debugger container', () => {
  let parent: ReactWrapper;
  let wrapper: ReactWrapper;

  beforeAll(() => {
    parent = mount(
      <NgrokStatusIndicator
        timeIntervalSinceLastPing={TunnelCheckTimeInterval.Now}
        tunnelStatus={TunnelStatus.Active}
        header="Ngrok Tunnel Status"
      />
    );

    wrapper = parent.find(NgrokStatusIndicator);
  });

  it('should render without errors', () => {
    expect(wrapper.find(NgrokStatusIndicator)).toBeDefined();
  });

  it('should show correct time interval when updated', () => {
    expect(wrapper.find(NgrokStatusIndicator)).toBeDefined();
    expect(wrapper.html().includes('Refreshed now')).toBeTruthy();
    parent.setProps({ timeIntervalSinceLastPing: TunnelCheckTimeInterval.FirstInterval });
    expect(wrapper.html().includes('Refreshed 20 seconds ago')).toBeTruthy();
    parent.setProps({ timeIntervalSinceLastPing: TunnelCheckTimeInterval.SecondInterval });
    expect(wrapper.html().includes('Refreshed 40 seconds ago')).toBeTruthy();
    parent.setProps({ timeIntervalSinceLastPing: TunnelCheckTimeInterval.Now });
    expect(wrapper.html().includes('Refreshed now')).toBeTruthy();
  });
});
