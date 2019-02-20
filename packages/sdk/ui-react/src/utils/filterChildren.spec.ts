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

import { filterChildren, hmrSafeNameComparison } from './filterChildren';

jest.mock('react', () => ({
  Children: {
    map: (array, fn) => array.map(fn),
  },
}));

describe('filterChildren', () => {
  it('should compare element names safely', () => {
    // test all cases of || operator (no matching names or display names)
    const child1 = { name: 'name1', displayName: 'dispalyName1' };
    const child2 = { name: 'name2', displayName: 'displayName2' };

    expect(hmrSafeNameComparison(child1, child2)).toBe(false);

    // invert result
    expect(hmrSafeNameComparison(child1, child2, true)).toBe(true);
  });

  it('should filterChildren according to a predicate', () => {
    const child1 = { name: 'someChild' };
    const child2 = { name: 'otherChild' };
    const predicate = child => child.name.startsWith('some');

    const filteredChildren = filterChildren([child1, child2], predicate);

    expect(filteredChildren).toHaveLength(2);
    expect(filteredChildren[0]).toBe(child1);
    expect(filteredChildren[1]).toBe(false);
  });
});
