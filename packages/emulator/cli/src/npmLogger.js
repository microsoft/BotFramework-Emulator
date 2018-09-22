"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const log = require("npmlog");
const level_1 = require("@bfemulator/emulator-core/lib/types/log/level");
function shortId(id) {
    return [id.substr(0, 3), id.substr(-5)].join('...');
}
function logLevel(logLevel) {
    switch (logLevel) {
        case level_1.default.Error:
            return log.error;
        case level_1.default.Info:
            return log.info;
        case level_1.default.Warn:
            return log.warn;
        default:
            return log.silly;
    }
}
class NpmLogger {
    logActivity(conversationId, activity, role) {
        log.verbose(shortId(conversationId), `Activity to ${role}`, activity);
    }
    logMessage(conversationId, ...items) {
        items.forEach(message => {
            switch (message.type) {
                case "text": {
                    logLevel(message.payload.level)(shortId(conversationId), message.payload.text);
                }
            }
        });
    }
    logException(conversationId, err) {
        log.error(shortId(conversationId), err.message);
    }
}
exports.default = NpmLogger;
