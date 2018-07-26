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
import { AZURE_ARM_TOKEN_DATA_CHANGED, AZURE_BEGIN_AUTH_WORKFLOW, } from '../action/azureAuthActions';
const initialState = {
    armToken: null,
    persistLogin: false
};
export default function azureAuth(state = initialState, action) {
    const { payload = {}, type } = action;
    const { armToken } = payload;
    switch (type) {
        case AZURE_BEGIN_AUTH_WORKFLOW:
            return Object.assign({}, state, { armToken: 'invalid__' + Math.floor(Math.random() * 9999) });
        case AZURE_ARM_TOKEN_DATA_CHANGED:
            return Object.assign({}, state, { armToken });
        default:
            return state;
    }
}
//# sourceMappingURL=azureAuthReducer.js.map