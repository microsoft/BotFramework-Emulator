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

import { Reducer } from 'redux';
import { IUserSettings, usersDefault } from '../../types/serverSettingsTypes'
import { IUser } from '../../types/userTypes';


export type UsersAction = {
    type: 'Users_SetCurrentUser',
    state: {
       user: IUser
    }
} | {
    type: 'Users_AddUsers',
    state: {
        users: IUser[]
    }
} | {
    type: 'Users_RemoveUsers',
    state: {
        users: IUser[]
    }
}

export const usersReducer: Reducer<IUserSettings> = (
    state = usersDefault,
    action: UsersAction
) => {
    switch (action.type) {
        case 'Users_SetCurrentUser':
            const usersById = Object.assign({}, state.usersById );
            usersById[action.state.user.id] = action.state.user;
            return Object.assign({}, { currentUserId: action.state.user.id, usersById });
        case 'Users_AddUsers': {
            let newUsersById = {};
            for(let key in action.state.users) {
                let user = action.state.users[key];
                newUsersById[user.id] = user;
            }
            return Object.assign({}, state, { usersById: newUsersById });
        }
        case 'Users_RemoveUsers': {
            //Object.assign({}, state, { }
            return state;
        }
        default:
            return state;
    }
}
