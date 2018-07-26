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
export var BotActions;
(function (BotActions) {
    BotActions["create"] = "BOT/CREATE";
    BotActions["load"] = "BOT/LOAD";
    BotActions["setActive"] = "BOT/SET_ACTIVE";
    BotActions["close"] = "BOT/CLOSE";
})(BotActions || (BotActions = {}));
export function create(bot, botFilePath, secret) {
    return {
        type: BotActions.create,
        payload: {
            bot,
            botFilePath,
            secret
        }
    };
}
export function load(bots) {
    // prune bad bots
    bots = bots.filter(bot => !!bot);
    return {
        type: BotActions.load,
        payload: {
            bots
        }
    };
}
/**
 *
 * @param bot The new active bot
 */
export function setActive(bot) {
    return {
        type: BotActions.setActive,
        payload: {
            bot
        }
    };
}
export function close() {
    return {
        type: BotActions.close,
        payload: {}
    };
}
//# sourceMappingURL=botActions.js.map