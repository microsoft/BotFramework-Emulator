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
import * as React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { combineReducers, createStore } from 'redux';
import {
  logEntry,
  textItem,
} from '@bfemulator/emulator-core/lib/types/log/util';
import LogLevel from '@bfemulator/emulator-core/lib/types/log/level';

import { bot } from '../../../../../data/reducer/bot';
import { clientAwareSettings } from '../../../../../data/reducer/clientAwareSettingsReducer';
import { load, setActive } from '../../../../../data/action/botActions';
import { theme } from '../../../../../data/reducer/themeReducer';
import { switchTheme } from '../../../../../data/action/themeActions';
import { ExtensionManager } from '../../../../../extensions';
import { LogService } from '../../../../../platform/log/logService';

import { InspectorContainer } from './inspectorContainer';
import { Inspector } from './inspector';

const mockStore = createStore(
  combineReducers({ theme, bot, clientAwareSettings }),
  {}
);

jest.mock('../../../panel/panel.scss', () => ({}));

jest.mock('../../../../../data/store', () => ({
  get store() {
    return mockStore;
  },
}));

const mockState = {
  bot: {
    description: '',
    internal: {
      location:
        'C:\\Users\\blerg\\Documents\\dev\\BotBuilder-Samples\\javascript_nodejs\\' +
        '50.contoso-cafe-bot\\contoso-cafe-bot.bot',
    },
    name: 'contoso-cafe-bot',
    overrides: null,
    path:
      'C:\\Users\\blerg\\Documents\\dev\\BotBuilder-Samples\\javascript_nodejs\\' +
      '50.contoso-cafe-bot\\contoso-cafe-bot.bot',
    padlock: '',
    services: [
      {
        appId: '',
        appPassword: '',
        endpoint: 'http://localhost:3978/api/messages',
        id: 'http://localhost:3978/api/messages',
        name: 'contoso-cafe-bot',
        type: 'endpoint',
      },
      {
        appId: 'cb904573-3d6f-46b0-80b9-b23a24e49152',
        authoringKey: 'mathmatical!',
        id: '60',
        name: 'cafeDispatchModel',
        region: 'westus',
        subscriptionKey: 'mathmatical!',
        type: 'luis',
        version: '0.1',
      },
      {
        appId: 'e01dc6a8-e2cb-4a96-8a41-f10730c41c43',
        authoringKey: 'mathmatical!',
        id: '235',
        name: 'cafeBotBookTableTurnN',
        region: 'westus',
        subscriptionKey: 'mathmatical!',
        type: 'luis',
        version: '0.1',
      },
      {
        endpointKey: 'mathmatical!',
        hostname: 'https://contosocafeqnab8.azurewebsites.net/qnamaker',
        id: '163',
        kbId: '1234',
        name: 'cafeFaqChitChat',
        subscriptionKey: 'd30ebbcc44ef4f07bae1a0e31b69f709',
        type: 'qna',
      },
      {
        appId: 'd59fa0b8-2398-4a7c-8043-224a4153494d',
        authoringKey: 'mathmatical!',
        id: '111',
        name: 'getUserProfile',
        region: 'westus',
        subscriptionKey: 'mathmatical!',
        type: 'luis',
        version: '0.1',
      },
    ],
    version: '2.0',
  },
  document: {
    documentId: 'a00c2150-b6dc-11e8-9139-bbce58b6f97c',
    inspectorObjects: [
      {
        accessories: [],
        channelId: 'emulator',
        conversation: {
          id: 'd298cdb0-bad5-11e8-bffe-a55cd19d7f71|livechat',
        },
        from: {
          id: 'http://localhost:3978/api/messages',
          name: 'Bot',
          role: 'bot',
        },
        id: 'ed50b550-bad5-11e8-b74d-8fc778b06796',
        label: 'Luis Trace',
        localTimestamp: '2018-09-17T17:01:00-07:00',
        name: 'LuisRecognizer',
        recipient: {
          id: 'default-user',
          role: 'user',
        },
        replyToId: 'ecba8fd0-bad5-11e8-b74d-8fc778b06796',
        serviceUrl: 'http://localhost:54725',
        timestamp: '2018-09-18T00:01:00.709Z',
        type: 'trace',
        value: {
          luisModel: {
            ModelID: 'cb904573-3d6f-46b0-80b9-b23a24e49152',
          },
          luisOptions: {
            Staging: false,
          },
          luisResult: {
            entities: [],
            query: 'HI',
            topScoringIntent: {
              intent: 'ChitChat',
              score: 0.8652684,
            },
          },
          recognizerResult: {
            entities: {
              $instance: {},
            },
            intents: {
              ChitChat: {
                score: 0.8652684,
              },
            },
            luisResult: null,
            text: 'HI',
          },
        },
        valueType: 'https://www.luis.ai/schemas/trace',
      },
    ],
  },
  themeInfo: {
    themeName: 'Dark',
    themeHref: null,
    themeComponents: [
      'http://localhost:3000/css/neutral.css',
      'http://localhost:3000/themes/dark.css',
      'http://localhost:3000/css/fonts.css',
      'http://localhost:3000/css/redline.css',
    ],
  },
};

const mockExtensions = [
  {
    client: {
      basePath: '',
      inspectors: [
        {
          accessories: [
            {
              id: 'train',
              states: {
                default: {
                  icon: 'Refresh',
                  label: 'Train',
                },
                working: {
                  icon: 'Spinner',
                  label: 'Training',
                },
              },
            },
            {
              id: 'publish',
              states: {
                default: {
                  icon: 'Share',
                  label: 'Publish',
                },
                working: {
                  icon: 'Spinner',
                  label: 'Publishing',
                },
              },
            },
          ],
          criteria: {
            path: '$.type',
            value: 'message',
          },
          name: 'JSON',
          src:
            'file:///C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/app/' +
            'main/node_modules/@bfemulator/extension-json/index.html',
          summaryText: ['attachments.0.contentType', 'text'],
        },
      ],
    },
    name: 'JSON',
    node: {},
  },
];
ExtensionManager.addExtension(mockExtensions[0], '1234');
jest.mock('./inspector.scss', () => ({}));

describe('The Inspector component', () => {
  const src = 'file:\\\\c:\\some\\path';
  let parent;
  let node;
  const documentCreateElement = document.createElement.bind(document);
  document.createElement = function(...args: any[]): any {
    const el = documentCreateElement(...args);
    el.send = function() {
      return true;
    };
    return el;
  };
  beforeEach(() => {
    mockStore.dispatch(switchTheme('light', ['vars.css', 'light.css']));
    mockStore.dispatch(load([mockState.bot]));
    mockStore.dispatch(setActive(mockState.bot as any));

    parent = mount(
      <Provider store={mockStore}>
        <InspectorContainer document={mockState.document} inspector={{ src }} />
      </Provider>
    );

    node = parent.find(Inspector);
  });

  it('should render deeply', () => {
    expect(parent.find(InspectorContainer)).not.toBe(null);
    expect(node).not.toBe(null);
  });

  it('should render accessory button when accessory buttons exist in the config', () => {
    const buttons = node.find('button');
    expect(buttons.length).not.toBe(0);
  });

  it('should enable/disable the accessory button when asked to do so by the extension', () => {
    const instance = node.instance();
    instance.enableAccessory('train', false);
    expect(instance.state.buttons[0].enabled).toBeFalsy();

    instance.enableAccessory('train', true);
    expect(instance.state.buttons[0].enabled).toBeTruthy();
  });

  it('should set the accessory state when asked to do so by the extension', () => {
    const instance = node.instance();
    instance.setAccessoryState('train', 'working');

    expect(instance.state.buttons[0].state).toEqual('working');
  });

  it('should set the inspector title when asked to do so by the extension', () => {
    const instance = node.instance();
    instance.setInspectorTitle('Yo!');

    expect(instance.state.title).toBe('Yo!');
  });

  it('should send the initialization stack to the inspector when the dom is ready', () => {
    const instance = node.instance();
    const instanceSpy = jest.spyOn(
      instance,
      'sendInitializationStackToInspector'
    );
    const event = { currentTarget: { removeEventListener: () => true } };
    const eventSpy = jest.spyOn(event.currentTarget, 'removeEventListener');

    instance.onWebViewDOMReady(event as any);
    expect(instanceSpy).toHaveBeenCalled();
    expect(eventSpy).toHaveBeenCalled();
  });

  describe('should handle the ipc message', () => {
    let instance;
    let event;
    let dateNow;

    beforeAll(() => {
      dateNow = Date.now;
      Date.now = () => 1;
    });

    afterAll(() => {
      Date.now = dateNow;
    });

    beforeEach(() => {
      instance = node.instance();
      event = { channel: '', args: [1, 2] };
    });

    it('"enable-accessory"', () => {
      event.channel = 'enable-accessory';
      const spy = jest.spyOn(instance, 'enableAccessory');
      instance.ipcMessageEventHandler(event);

      expect(spy).toHaveBeenCalledWith(event.args[0], event.args[1]);
    });

    it('"set-accessory-state"', () => {
      event.channel = 'set-accessory-state';
      const spy = jest.spyOn(instance, 'setAccessoryState');

      instance.ipcMessageEventHandler(event);

      expect(spy).toHaveBeenCalledWith(event.args[0], event.args[1]);
    });

    it('"set-inspector-title"', () => {
      event.channel = 'set-inspector-title';
      const titleSpy = jest.spyOn(instance, 'setInspectorTitle');
      const stateSpy = jest.spyOn(instance, 'setState');

      instance.ipcMessageEventHandler(event);

      expect(stateSpy).toHaveBeenCalledWith({ titleOverride: event.args[0] });
      expect(titleSpy).toHaveBeenCalledWith(event.args[0]);
    });

    it('"logger.log" or "logger.error"', () => {
      event.channel = 'logger.log';
      const logSpy = jest.spyOn(LogService, 'logToDocument');
      const inspectorName = mockExtensions[0].name;
      const text = `[${inspectorName}] ${event.args[0]}`;
      instance.ipcMessageEventHandler(event);

      expect(logSpy).toHaveBeenCalledWith(
        mockState.document.documentId,
        logEntry(textItem(LogLevel.Info, text))
      );
    });
  });
});
