import * as React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { combineReducers, createStore } from 'redux';
import bot from '../../../../../data/reducer/bot';
import { load, setActive } from '../../../../../data/action/botActions';
import theme from '../../../../../data/reducer/themeReducer';
import { Inspector } from './inspector';
import { InspectorContainer } from './inspectorContainer';
import { switchTheme } from '../../../../../data/action/themeActions';

const mockStore = createStore(combineReducers({ theme, bot }), {});

jest.mock('../../../../../data/store', () => ({
  get default() {
    return mockStore;
  }
}));
const mockState = {
  'bot': {
    'description': '',
    'internal': {
      'location': 'C:\\Users\\blerg\\Documents\\dev\\BotBuilder-Samples\\javascript_nodejs\\' +
        '50.contoso-cafe-bot\\contoso-cafe-bot.bot'
    },
    'name': 'contoso-cafe-bot',
    'overrides': null,
    'path': 'C:\\Users\\blerg\\Documents\\dev\\BotBuilder-Samples\\javascript_nodejs\\' +
      '50.contoso-cafe-bot\\contoso-cafe-bot.bot',
    'secretKey': '',
    'services': [
      {
        'appId': '',
        'appPassword': '',
        'endpoint': 'http://localhost:3978/api/messages',
        'id': 'http://localhost:3978/api/messages',
        'name': 'contoso-cafe-bot',
        'type': 'endpoint'
      },
      {
        'appId': 'cb904573-3d6f-46b0-80b9-b23a24e49152',
        'authoringKey': 'mathmatical!',
        'id': '60',
        'name': 'cafeDispatchModel',
        'region': 'westus',
        'subscriptionKey': 'mathmatical!',
        'type': 'luis',
        'version': '0.1'
      },
      {
        'appId': 'e01dc6a8-e2cb-4a96-8a41-f10730c41c43',
        'authoringKey': 'mathmatical!',
        'id': '235',
        'name': 'cafeBotBookTableTurnN',
        'region': 'westus',
        'subscriptionKey': 'mathmatical!',
        'type': 'luis',
        'version': '0.1'
      },
      {
        'endpointKey': 'mathmatical!',
        'hostname': 'https://contosocafeqnab8.azurewebsites.net/qnamaker',
        'id': '163',
        'kbId': '1234',
        'name': 'cafeFaqChitChat',
        'subscriptionKey': 'd30ebbcc44ef4f07bae1a0e31b69f709',
        'type': 'qna'
      },
      {
        'appId': 'd59fa0b8-2398-4a7c-8043-224a4153494d',
        'authoringKey': 'mathmatical!',
        'id': '111',
        'name': 'getUserProfile',
        'region': 'westus',
        'subscriptionKey': 'mathmatical!',
        'type': 'luis',
        'version': '0.1'
      }
    ],
    'version': '2.0'
  },
  'inspectObj': {
    'attachments': [
      {
        'content': {
          '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
          'actions': [
            {
              'data': {
                'intent': 'Book_Table'
              },
              'title': 'Book table',
              'type': 'Action.Submit'
            },
            {
              'data': {
                'intent': 'What_can_you_do'
              },
              'title': 'What can you do?',
              'type': 'Action.Submit'
            }
          ],
          'body': [
            {
              'columns': [
                {
                  'items': [
                    {
                      'size': 'extraLarge',
                      'text': 'Contoso Cafe',
                      'type': 'TextBlock',
                      'weight': 'bolder'
                    },
                    {
                      'size': 'Medium',
                      'text': 'Hello, I\'m the Cafe bot! How can I be of help today?',
                      'type': 'TextBlock',
                      'wrap': true
                    }
                  ],
                  'spacing': 'large',
                  'type': 'Column'
                },
                {
                  'items': [
                    {
                      'horizontalAlignment': 'center',
                      'size': 'medium',
                      'type': 'Image',
                      'url': 'http://contosocafeontheweb.azurewebsites.net/assets/contoso_logo_black.png'
                    }
                  ],
                  'spacing': 'small',
                  'type': 'Column',
                  'width': 'auto'
                }
              ],
              'height': 'stretch',
              'horizontalAlignment': 'Center',
              'spacing': 'large',
              'type': 'ColumnSet'
            }
          ],
          'height': 'stretch',
          'horizontalAlignment': 'Center',
          'separator': true,
          'type': 'AdaptiveCard',
          'version': '1.0'
        },
        'contentType': 'application/vnd.microsoft.card.adaptive'
      }
    ],
    'channelId': 'emulator',
    'conversation': {
      'id': 'a0117880-b6dc-11e8-9139-bbce58b6f97c|livechat'
    },
    'from': {
      'id': 'http://localhost:3978/api/messages',
      'name': 'Bot',
      'role': 'bot'
    },
    'id': 'a0e9fe30-b6dc-11e8-8449-633755841db8',
    'localTimestamp': '2018-09-12T15:38:54-07:00',
    'recipient': {
      'id': 'default-user',
      'role': 'user'
    },
    'replyToId': 'a0217e10-b6dc-11e8-8449-633755841db8',
    'serviceUrl': 'https://1161d19b.ngrok.io',
    'timestamp': '2018-09-12T22:38:54.355Z',
    'type': 'message'
  },
  'themeInfo': {
    'themeName': 'Dark',
    'themeHref': null,
    'themeComponents': [
      'http://localhost:3000/css/neutral.css',
      'http://localhost:3000/themes/dark.css',
      'http://localhost:3000/css/fonts.css',
      'http://localhost:3000/css/redline.css'
    ]
  }
};

jest.mock('./inspector.scss', () => ({}));
jest.mock('../../../../../platform/settings/settingsService', () => ({
  SettingsService: {
    emulator: {
      cwdAsBase: ''
    }
  }
}));
describe('The Inspector component should', () => {
  const documentId = 'a00c2150-b6dc-11e8-9139-bbce58b6f97c';
  const src = 'file:\\\\c:\\some\\path';
  let parent;
  let node;
  const documentCreateElement = document.createElement.bind(document);
  document.createElement = function (...args: any[]): any {
    const el = documentCreateElement(...args);
    el.send = function () {
      return true;
    };
    return el;
  };
  beforeEach(() => {

    mockStore.dispatch(switchTheme('light', ['vars.css', 'light.css']));
    mockStore.dispatch(load([mockState.bot]));
    mockStore.dispatch(setActive(mockState.bot as any));

    parent = mount(<Provider store={ mockStore }>
      <InspectorContainer document={ { documentId } } inspector={ { src } }/>
    </Provider>);

    node = parent.find(Inspector);
  });

  it('should render deeply', () => {
    expect(parent.find(InspectorContainer)).not.toBe(null);
    expect(node).not.toBe(null);
  });

  it('should have more coverage later', () => {
    expect(true);
  });
});
