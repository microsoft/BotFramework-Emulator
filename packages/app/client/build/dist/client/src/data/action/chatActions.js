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
export var ChatActions;
(function (ChatActions) {
    ChatActions["newChat"] = "CHAT/DOCUMENT/NEW";
    ChatActions["openChat"] = "CHAT/DOCUMENT/OPEN";
    ChatActions["closeChat"] = "CHAT/DOCUMENT/CLOSE";
    ChatActions["pingChat"] = "CHAT/DOCUMENT/PING";
    ChatActions["newConversation"] = "CHAT/CONVERSATION/NEW";
    ChatActions["appendLog"] = "CHAT/LOG/APPEND";
    ChatActions["clearLog"] = "CHAT/LOG/CLEAR";
    ChatActions["setInspectorObjects"] = "CHAT/INSPECTOR/OBJECTS/SET";
    ChatActions["addTranscript"] = "CHAT/TRANSCRIPT/ADD";
    ChatActions["clearTranscripts"] = "CHAT/TRANSCRIPT/CLEAR";
    ChatActions["removeTranscript"] = "CHAT/TRANSCRIPT/REMOVE";
})(ChatActions || (ChatActions = {}));
export function pingDocument(documentId) {
    return {
        type: ChatActions.pingChat,
        payload: {
            documentId
        }
    };
}
export function addTranscript(filename) {
    return {
        type: ChatActions.addTranscript,
        payload: {
            filename
        }
    };
}
export function clearTranscripts() {
    return {
        type: ChatActions.clearTranscripts,
        payload: {}
    };
}
export function removeTranscript(filename) {
    return {
        type: ChatActions.removeTranscript,
        payload: {
            filename
        }
    };
}
export function newDocument(documentId, mode, additionalData) {
    return {
        type: ChatActions.newChat,
        payload: Object.assign({ pingId: 0, mode,
            documentId, conversationId: null, directLine: null, log: {
                entries: []
            }, inspectorObjects: [], ui: {
                horizontalSplitter: [
                    {
                        absolute: null,
                        percentage: 50
                    },
                    {
                        absolute: null,
                        percentage: 50
                    }
                ],
                verticalSplitter: [
                    {
                        absolute: null,
                        percentage: 50
                    },
                    {
                        absolute: null,
                        percentage: 50
                    }
                ],
            } }, additionalData)
    };
}
export function closeDocument(documentId) {
    return {
        type: ChatActions.closeChat,
        payload: {
            documentId,
        }
    };
}
export function newConversation(documentId, options) {
    return {
        type: ChatActions.newConversation,
        payload: {
            documentId,
            options
        }
    };
}
export function appendToLog(documentId, entry) {
    return {
        type: ChatActions.appendLog,
        payload: {
            documentId,
            entry
        }
    };
}
export function clearLog(documentId) {
    return {
        type: ChatActions.clearLog,
        payload: {
            documentId,
        }
    };
}
export function setInspectorObjects(documentId, objs) {
    objs = Array.isArray(objs) ? objs : [objs];
    return {
        type: ChatActions.setInspectorObjects,
        payload: {
            documentId,
            objs
        }
    };
}
//# sourceMappingURL=chatActions.js.map