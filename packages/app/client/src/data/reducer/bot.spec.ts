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

import { bot, BotState } from "./bot";
import { BotAction, close, load, setActive } from "../action/botActions";
import { BotInfo } from "@bfemulator/app-shared";
import { BotConfigWithPath } from "@bfemulator/sdk-shared";

describe("Bot reducer tests", () => {
  const DEFAULT_STATE: BotState = {
    activeBot: null,
    botFiles: [],
    activeBotDigest: ""
  };

  it("should return unaltered state for non-matching action type", () => {
    const emptyAction: BotAction = { type: null, payload: null };
    const startingState = { ...DEFAULT_STATE };
    const endingState = bot(DEFAULT_STATE, emptyAction);
    expect(endingState).toEqual(startingState);
  });

  describe("setting a bot as active", () => {
    const testbot: BotConfigWithPath = {
      name: "bot1",
      description: "",
      padlock: null,
      services: [],
      path: "somePath",
      version: "0.1"
    };

    it("should set a bot as active", () => {
      const action = setActive(testbot);
      const state = bot(DEFAULT_STATE, action);
      expect(state.activeBot).toEqual(testbot);
    });

    it("should move the bot to the top of the recently used bots list", () => {
      const testbots: BotInfo[] = [
        {
          displayName: "bot2",
          path: "path2",
          secret: "test-secret"
        },
        {
          displayName: "bot3",
          path: "path3",
          secret: null
        },
        {
          displayName: "bot1",
          path: "somePath",
          secret: null
        }
      ];

      const startingState: BotState = {
        ...DEFAULT_STATE,
        botFiles: testbots
      };

      const action = setActive(testbot);
      const endingState = bot(startingState, action);
      expect(endingState.botFiles[0].path).toBe("somePath");
    });

    it("should preserve overrides from the previous bot if they have the same path", () => {
      const startingState: BotState = {
        ...DEFAULT_STATE,
        activeBot: {
          name: "someActiveBot",
          description: "",
          services: [],
          path: "somePath",
          padlock: null,
          overrides: {
            endpoint: {
              endpoint: "someEndpointOverride",
              appId: "someAppId",
              appPassword: "someAppPw",
              id: "someEndpointOverride"
            }
          }
        } as any
      };

      const action = setActive(testbot);
      const endingState = bot(startingState, action);
      const activeBot = endingState.activeBot;

      expect(activeBot.name).not.toBe("someActiveBot");

      expect(activeBot.overrides).toBeTruthy();
      const endpointOverrides = activeBot.overrides.endpoint;
      expect(endpointOverrides.endpoint).toBe("someEndpointOverride");
      expect(endpointOverrides.id).toBe("someEndpointOverride");
      expect(endpointOverrides.appId).toBe("someAppId");
      expect(endpointOverrides.appPassword).toBe("someAppPw");
    });

    it("should throw away overrides from the previous bot if they don't have the same path", () => {
      const startingState: BotState = {
        ...DEFAULT_STATE,
        activeBot: {
          name: "someActiveBot",
          description: "",
          services: [],
          path: "someOtherPath",
          padlock: null,
          overrides: {
            endpoint: {
              endpoint: "someEndpointOverride",
              appId: "someAppId",
              appPassword: "someAppPw",
              id: "someEndpointOverride"
            }
          }
        } as any
      };

      const action = setActive(testbot);
      const endingState = bot(startingState, action);
      const activeBot = endingState.activeBot;

      expect(activeBot.name).not.toBe("someActiveBot");
      expect(activeBot.overrides).toBeFalsy();
    });
  });

  it("should load an array of bots", () => {
    const bots: BotInfo[] = [
      {
        displayName: "bot1",
        path: "path1",
        secret: null
      },
      {
        displayName: "bot2",
        path: "path2",
        secret: "test-secret"
      },
      {
        displayName: "bot3",
        path: "path3",
        secret: null
      },
      null
    ];
    const action = load(bots);
    const state = bot(DEFAULT_STATE, action);
    expect(state.botFiles).not.toEqual(bots);
    expect(state.botFiles.length).toBe(3);
    expect(state.botFiles).toEqual([
      {
        displayName: "bot1",
        path: "path1",
        secret: null
      },
      {
        displayName: "bot2",
        path: "path2",
        secret: "test-secret"
      },
      {
        displayName: "bot3",
        path: "path3",
        secret: null
      }
    ]);
  });

  it("should close a bot", () => {
    const startingState: BotState = {
      ...DEFAULT_STATE,
      activeBot: {
        name: "bot",
        description: "this is a test bot",
        padlock: null,
        services: []
      } as any
    };
    const action = close();
    const endingState = bot(startingState, action);
    expect(endingState.activeBot).toBe(null);
  });
});
