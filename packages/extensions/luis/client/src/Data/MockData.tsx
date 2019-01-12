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

import { AppState } from "../App";
import { ButtonSelected } from "../Controls/ControlBar/ControlBar";
import { AppInfo } from "../Luis/AppInfo";
import { IntentInfo } from "../Luis/IntentInfo";
import { LuisTraceInfo } from "../Models/LuisTraceInfo";

export default class MockState implements AppState {
  public traceInfo: LuisTraceInfo = {
    luisModel: {
      ModelID: "6209a76f-e836-413b-ba92-a5772d1b2087",
      SubscriptionKey: "****"
    },
    luisResult: {
      query: "hi",
      entities: [],
      compositeEntities: [],
      intents: [],
      topScoringIntent: {
        intent: "TopScoring",
        score: 0.5
      }
    },
    recognizerResult: {
      entities: {
        $instance: {
          Airline: [
            {
              endIndex: 24,
              score: null,
              startIndex: 20,
              text: "delta"
            },
            {
              endIndex: 24,
              score: null,
              startIndex: 20,
              text: "delta"
            },
            {
              endIndex: 24,
              score: null,
              startIndex: 20,
              text: "delta"
            },
            {
              endIndex: 24,
              score: null,
              startIndex: 20,
              text: "delta"
            },
            {
              endIndex: 24,
              score: null,
              startIndex: 20,
              text: "delta"
            },
            {
              endIndex: 24,
              score: null,
              startIndex: 20,
              text: "delta"
            },
            {
              endIndex: 24,
              score: null,
              startIndex: 20,
              text: "delta"
            },
            {
              endIndex: 24,
              score: null,
              startIndex: 20,
              text: "delta"
            },
            {
              endIndex: 24,
              score: null,
              startIndex: 20,
              text: "delta"
            }
          ]
        },
        Airline: [["Delta"]]
      },
      intents: {
        Greeting: { score: 0.99 },
        Travel: { score: 0.01 }
      },
      text: "hi"
    },
    luisOptions: {}
  };
  public appInfo: AppInfo = {
    activeVersion: "0.1",
    authorized: false,
    name: "Contoso App",
    appId: "6209a76f-e836-413b-ba92-a5772d1b2087",
    endpoints: {},
    isDispatchApp: false
  };
  public persistentState: {};
  public controlBarButtonSelected: ButtonSelected.RawResponse;
  public id: "6209a76f-e836-413b-ba92-a5772d1b2003";
  public authoringKey: "";
  public intentInfo: IntentInfo[] = [
    {
      id: "6209a76f-e836-413b-ba92-a5772d1b2000",
      name: "Greeting"
    },
    {
      id: "6209a76f-e836-413b-ba92-a5772d1b2001",
      name: "Cancel"
    },
    {
      id: "6209a76f-e836-413b-ba92-a5772d1b2002",
      name: "Travel"
    }
  ];
}
