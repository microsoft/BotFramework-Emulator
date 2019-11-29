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

import { mount, ReactWrapper } from 'enzyme';
import * as React from 'react';

import { KvPair } from './kvPair';

describe('The KvPair component', () => {
  let node: ReactWrapper<{}, {}, any>;
  const mockOnChange = jest.fn(() => null);

  beforeEach(() => {
    node = mount(<KvPair onChange={mockOnChange} />);
  });

  it('should render a key value pair row for each pair', () => {
    node.setState({
      kvPairs: [
        { key: 'key1', value: 'val1' },
        { key: 'key2', value: 'val2' },
      ],
      numRows: 2,
    });

    expect(node.find('tr')).toHaveLength(4);
  });

  it('should call the onChange callback with the updated kv pairs', () => {
    const kvPairs = [
      { key: 'key1', value: 'val1' },
      { key: '', value: '' },
      { key: 'key3', value: 'val3' },
    ];
    node.setState({ kvPairs, numRows: 3 });
    // update value of row 3
    const mockChangeEvent = { target: { dataset: { index: 2, prop: 'value' }, value: 'updatedValue3' } };
    node.instance().onChange(mockChangeEvent);

    expect(mockOnChange).toHaveBeenCalledWith({
      key1: 'val1',
      // second kv pair should have been pruned because it was empty
      key3: 'updatedValue3',
    });
  });

  it('should add a key value pair', () => {
    const mockKvPairs = [{ key: 'key1', value: 'val1' }];
    node.setState({ kvPairs: mockKvPairs, numRows: 1 });

    node.instance().onAddKvPair();

    expect(node.instance().state).toEqual({
      alert: '',
      kvPairs: [
        { key: 'key1', value: 'val1' },
        { key: '', value: '' },
      ],
      numRows: 2,
    });
  });

  it('should remove a key value pair', () => {
    const mockKvPairs = [
      { key: 'key1', value: 'val1' },
      { key: 'key2', value: 'val2' },
    ];
    node.setState({ kvPairs: mockKvPairs, numRows: 2 });

    node.instance().onRemoveKvPair();

    expect(node.instance().state).toEqual({
      alert: 'Removed key value pair, row 1',
      kvPairs: [{ key: 'key1', value: 'val1' }],
      numRows: 1,
    });
    expect(mockOnChange).toHaveBeenCalledWith({ key1: 'val1' });
  });
});
