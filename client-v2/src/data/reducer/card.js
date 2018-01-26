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
                    "type": "TextBlock",
                    "text": "Your registration is almost complete",
                    "size": "medium",
                    "weight": "bolder"
                  },
                  {
                    "type": "TextBlock",
                    "text": "What type of food do you prefer?",
                    "wrap": true
                  },
                  {
                    "type": "ImageSet",
                    "imageSize": "medium",
                    "images": [
                      {
                        "type": "Image",
                        "url": "http://contososcubabot.azurewebsites.net/assets/steak.jpg"
                      },
                      {
                        "type": "Image",
                        "url": "http://contososcubabot.azurewebsites.net/assets/chicken.jpg"
                      },
                      {
                        "type": "Image",
                        "url": "http://contososcubabot.azurewebsites.net/assets/tofu.jpg"
                      }
                    ]
                  }
                ],
                "actions": [
                  {
                    "type": "Action.ShowCard",
                    "title": "Steak",
                    "card": {
                      "type": "AdaptiveCard",
                      "body": [
                        {
                          "type": "TextBlock",
                          "text": "How would you like your steak prepared?",
                          "size": "medium",
                          "wrap": true
                        },
                        {
                          "type": "Input.ChoiceSet",
                          "id": "SteakTemp",
                          "style": "expanded",
                          "choices": [
                            {
                              "title": "Rare",
                              "value": "rare"
                            },
                            {
                              "title": "Medium-Rare",
                              "value": "medium-rare"
                            },
                            {
                              "title": "Well-done",
                              "value": "well-done"
                            }
                          ]
                        },
                        {
                          "type": "Input.Text",
                          "id": "SteakOther",
                          "isMultiline": true,
                          "placeholder": "Any other preparation requestes?"
                        }
                      ],
                      "actions": [
                        {
                          "type": "Action.Submit",
                          "title": "OK",
                          "data": {
                            "FoodChoice": "Steak"
                          }
                        }
                      ]
                    }
                  },
                  {
                    "type": "Action.ShowCard",
                    "title": "Chicken",
                    "card": {
                      "type": "AdaptiveCard",
                      "body": [
                        {
                          "type": "TextBlock",
                          "text": "Do you have any allergies?",
                          "size": "medium",
                          "wrap": true
                        },
                        {
                          "type": "Input.ChoiceSet",
                          "id": "ChickenAllergy",
                          "style": "expanded",
                          "isMultiSelect": true,
                          "choices": [
                            {
                              "title": "I'm allergic to peanuts",
                              "value": "peanut"
                            }
                          ]
                        },
                        {
                          "type": "Input.Text",
                          "id": "ChickenOther",
                          "isMultiline": true,
                          "placeholder": "Any other preparation requestes?"
                        }
                      ],
                      "actions": [
                        {
                          "type": "Action.Submit",
                          "title": "OK",
                          "data": {
                            "FoodChoice": "Chicken"
                          }
                        }
                      ]
                    }
                  },
                  {
                    "type": "Action.ShowCard",
                    "title": "Tofu (Vegetarian)",
                    "card": {
                      "type": "AdaptiveCard",
                      "body": [
                        {
                          "type": "TextBlock",
                          "text": "Would you like it prepared vegan?",
                          "size": "medium",
                          "wrap": true
                        },
                        {
                          "type": "Input.Toggle",
                          "id": "Vegetarian",
                          "title": "Please prepare it vegan",
                          "valueOn": "vegan",
                          "valueOff": "notVegan"
                        },
                        {
                          "type": "Input.Text",
                          "id": "VegOther",
                          "isMultiline": true,
                          "placeholder": "Any other preparation requestes?"
                        }
                      ],
                      "actions": [
                        {
                          "type": "Action.Submit",
                          "title": "OK",
                          "data": {
                            "FoodChoice": "Vegetarian"
                          }
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
