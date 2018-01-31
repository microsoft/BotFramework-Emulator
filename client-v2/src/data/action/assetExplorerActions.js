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

// TODO: create-react-app lockdown on module folder, and we want to refactor
//       (part of) this action out to be used by server. We could build a new
//       package for the refactored part. The new package can be npm-link,
//       npm-install-file, etc. Need to find a good dev story here.

// * 80% of actions, creation is only one side (main or renderer). Only the action name are shared.
// * 20% of actions maybe created by both side. Out of these actions:
//   * 80% of actions, their logic is different
//     * (?) Consider prompt: we call Electron for a native dialog. And in web app mode, we show the dialog in browser
//     * Think about a capability detection method (and overriding for dev story)
//   * 20% of actions, their logic is the same

export const OPEN_FOLDER = 'ASSET_EXPLORER/OPEN_FOLDER';
export const PROMPT_OPEN_FOLDER = 'ASSET_EXPLORER/PROMPT_OPEN_FOLDER';

export function openFolder(folder) {
    return {
        type: OPEN_FOLDER,
        meta: { send: true },
        payload: {
            folder
        }
    }
}

export function promptOpenFolder() {
    return {
        type: PROMPT_OPEN_FOLDER,
        meta: { send: true }
    };
}
