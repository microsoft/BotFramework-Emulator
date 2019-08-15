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

import { addUsers, setCurrentUser } from '../actions/userActions';

import { users } from './users';

describe('users reducer', () => {
  it('should return the unmodified state on unrecognized action', () => {
    expect(users(undefined, { type: '' } as any)).toEqual({});
  });

  it('should handle a set current user action', () => {
    const user: any = { id: 'user1' };
    const action = setCurrentUser(user);
    const state = users({} as any, action);

    expect(state).toEqual({ currentUserId: 'user1', usersById: { user1: user } });
  });

  it('should handle an add users action', () => {
    const initialState: any = {
      usersById: {
        user1: {},
      },
    };
    const action = addUsers([{ name: '', id: 'user1' }, { name: '', id: 'user2' }, { name: '', id: 'user3' }]);
    const state = users(initialState, action);

    expect(state).toEqual({
      usersById: {
        user1: {},
        user2: {
          name: '',
          id: 'user2',
        },
        user3: {
          name: '',
          id: 'user3',
        },
      },
    });
  });
});
