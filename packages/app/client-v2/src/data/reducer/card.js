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

import * as CardActions from '../action/cardActions';

const DEFAULT_STATE = {
  cards: {
    'card:1': {
      title: "My card",
      cardJson: JSON.stringify({
        "type": "AdaptiveCard",
        "version": "1.0",
        "body": [
          {
            "type": "Image",
            "url": "http://adaptivecards.io/content/adaptive-card-50.png"
          },
          {
            "type": "TextBlock",
            "text": "Hello **Adaptive Cards!**"
          },
          {
            "type": "Image",
            "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/250px-Google_2015_logo.svg.png"
          },
          {
            "type": "TextBlock",
            "text": "Some other text block :)"
          }
        ],
        "actions": [
          {
            "type": "Action.OpenUrl",
            "title": "Learn more",
            "url": "http://adaptivecards.io"
          },
          {
            "type": "Action.OpenUrl",
            "title": "GitHub",
            "url": "http://github.com/Microsoft/AdaptiveCards"
          },
          {
            "type": "Action.Submit",
            "title": "Submitting something",
            "data": {
              "foo": 1,
              "bar": "test",
              "other": false
            }
          },
          {
            "type": "Action.Submit",
            "title": "Submitting something else"
          },
          {
            "type": "Action.ShowCard",
            "title": "Action.ShowCard",
            "card": {
              "type": "AdaptiveCard",
              "body": [
                {
                  "type": "TextBlock",
                  "text":"What do you think?"
                }
              ],
              "actions": [
                {
                  "type":"Action.Submit",
                  "title":"Neat!"
                }
              ]
            }
          }
        ]
      }, null, "\t"),

      cardOutput: [],
      entities: ["ent1", "ent2", "ent3"]
    }
  }
};

export default function card(state = DEFAULT_STATE, action) {
  const payload = action.payload;

  switch (action.type) {
    case CardActions.UPDATE_JSON:
      state = {
        ...state,
        cards: {
          ...state.cards,
          [payload.id]: {
            ...state.cards[payload.id],
            cardJson: payload.json
          }
        }
      }
      break;
    case CardActions.ADD_OUTPUT_MSG:
      state = {
        ...state,
        cards: {
          ...state.cards,
          [payload.id]: {
            ...state.cards[payload.id],
            cardOutput: [...state.cards[payload.id].cardOutput, payload.msg]
          }
        }
      }
      break;
    case CardActions.CLEAR_OUTPUT_WINDOW:
      state = {
        ...state,
        cards: {
          ...state.cards,
          [payload.id]: {
            ...state.cards[payload.id],
            cardOutput: []
          }
        }
      }
      break;
    case CardActions.CREATE_CARD:
      state = {
        ...state,
        cards: {
          ...state.cards,
          [payload.id]: payload.card
        }
      }
      break;
    default:
      break;
  }
  return state;
}
