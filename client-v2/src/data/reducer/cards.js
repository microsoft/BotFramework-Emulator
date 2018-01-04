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

import {
    ADD_OUTPUT_MSG,
    CLEAR_OUTPUT_WINDOW,
    NEW_CARD,
    UPDATE_JSON
} from '../action/cardActions';
import { ContentType_Card } from '../../constants';

const DEFAULT_STATE = {
    cardId: {
        title: "My card",
        cardJson: "{}",
        cardOutput: [],
        entities: [],
        path: "C:\\somecard.json",
        contentType: ContentType_Card
    }
};

export default function cards(state = DEFAULT_STATE, action) {
    const payload = action.payload;
    let newState = Object.assign({}, state);
    let card = payload ? newState[payload.id] : null;

    switch (action.type) {
        case UPDATE_JSON:
            card.cardJson = payload.json;
            break;
        case ADD_OUTPUT_MSG:
            card.cardOutput = [...card.cardOutput, payload.msg];
            break;
        case CLEAR_OUTPUT_WINDOW:
            card.cardOutput = [];
            break;
        case NEW_CARD:
            newState[payload.id] = payload.card;
            break;
        default:
            break;
    }
    return newState;
}
