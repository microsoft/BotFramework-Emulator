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
import { mount, ReactWrapper } from 'enzyme';
import LogLevel from '@bfemulator/emulator-core/lib/types/log/level';
import { textItem } from '@bfemulator/emulator-core/lib/types/log/util';

import { number2, timestamp, LogEntry, LogEntryProps } from './logEntry';

jest.mock('./log.scss', () => ({}));

describe('logEntry component', () => {
  let wrapper: ReactWrapper;

  beforeEach(() => {
    const props: LogEntryProps = {
      document: {},
      entry: {
        timestamp: 0,
        items: [],
      },
    };
    wrapper = mount(<LogEntry {...props} />);
  });

  it('should render an outer entry component', () => {
    expect(wrapper.find('div')).toHaveLength(1);
  });

  it('should render a timestamped log entry with multiple items', () => {
    const entry = {
      timestamp: new Date(2018, 1, 1, 12, 34, 56).getTime(),
      items: [
        textItem(LogLevel.Debug, 'item1'),
        textItem(LogLevel.Debug, 'item2'),
        textItem(LogLevel.Debug, 'item3'),
      ],
    };
    wrapper.setProps({ entry });
    expect(wrapper.find('span.timestamp')).toHaveLength(1);
    expect(wrapper.find('span.text-item')).toHaveLength(3);

    const timestampNode = wrapper.find('span.timestamp');
    expect(timestampNode.html()).toContain('12:34:56');
  });

  test('number2', () => {
    const num1 = 5;
    const num2 = 34;
    const num3 = 666;

    expect(number2(num1)).toBe('05');
    expect(number2(num2)).toBe('34');
    expect(number2(num3)).toBe('66');
  });

  test('timestamp', () => {
    const time = Date.now();
    const date = new Date(time);
    const expectedHrs = number2(date.getHours());
    const expectedMins = number2(date.getMinutes());
    const expectedSeconds = number2(date.getSeconds());
    const expectedTimestamp = `${expectedHrs}:${expectedMins}:${expectedSeconds}`;

    expect(timestamp(time)).toBe(expectedTimestamp);
  });
});
