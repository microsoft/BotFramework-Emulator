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

import { mount } from 'enzyme';
import * as React from 'react';

import { KvPair } from './kvPair';

jest.mock('./connectedServiceEditor.scss', () => ({}));
describe('The KvPair component', () => {
  let node;
  let mockKvs;
  const mockOnChange = {
    onKvPairChanged: () => null,
  };

  beforeEach(() => {
    mockKvs = {
      someKey: 'someValue',
    };

    node = mount(
      <KvPair onChange={mockOnChange.onKvPairChanged} kvPairs={mockKvs} />
    );
  });

  it('should render at least one empty row when at least one non-empty row exist in the data', () => {
    const instance = node.instance();
    expect(instance.render().props.children.length).toBe(2);
  });

  it('should call the given callback with the updated kv pairs when "onChange()" is called', () => {
    const input = node.find('ul li:last-child input[data-prop="key"]');
    const instance = input.instance();
    instance.value = 'someKey2';

    node.instance().onChange({ target: instance });
    expect(node.state()).toEqual({
      kvPairs: [
        {
          key: 'someKey',
          value: undefined,
        },
        {
          key: 'someKey2',
          value: '',
        },
      ],
      length: 2,
    });
  });
});
