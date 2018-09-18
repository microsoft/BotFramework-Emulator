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
import { ExtensionManager } from '../../../../../extensions';

const mockStore = createStore(combineReducers({ theme, bot }), {});

jest.mock('../../../panel/panel.scss', () => ({}));

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
  'document': {
    'documentId': 'a00c2150-b6dc-11e8-9139-bbce58b6f97c',
    'inspectorObjects': [
      {
        'accessories': [],
        'channelId': 'emulator',
        'conversation': {
          'id': 'd298cdb0-bad5-11e8-bffe-a55cd19d7f71|livechat'
        },
        'from': {
          'id': 'http://localhost:3978/api/messages',
          'name': 'Bot',
          'role': 'bot'
        },
        'id': 'ed50b550-bad5-11e8-b74d-8fc778b06796',
        'label': 'Luis Trace',
        'localTimestamp': '2018-09-17T17:01:00-07:00',
        'name': 'LuisRecognizer',
        'recipient': {
          'id': 'default-user',
          'role': 'user'
        },
        'replyToId': 'ecba8fd0-bad5-11e8-b74d-8fc778b06796',
        'serviceUrl': 'http://localhost:54725',
        'timestamp': '2018-09-18T00:01:00.709Z',
        'type': 'trace',
        'value': {
          'luisModel': {
            'ModelID': 'cb904573-3d6f-46b0-80b9-b23a24e49152'
          },
          'luisOptions': {
            'Staging': false
          },
          'luisResult': {
            'entities': [],
            'query': 'HI',
            'topScoringIntent': {
              'intent': 'ChitChat',
              'score': 0.8652684
            }
          },
          'recognizerResult': {
            'entities': {
              '$instance': {}
            },
            'intents': {
              'ChitChat': {
                'score': 0.8652684
              }
            },
            'luisResult': null,
            'text': 'HI'
          }
        },
        'valueType': 'https://www.luis.ai/schemas/trace'
      }
    ]
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

const mockExtensions = [
  {
    'client': {
      'basePath': '',
      'inspectors': [
        {
          'accessories': [
            {
              'id': 'train',
              'states': {
                'default': {
                  'icon': 'Refresh',
                  'label': 'Train'
                },
                'working': {
                  'icon': 'Spinner',
                  'label': 'Training'
                }
              }
            },
            {
              'id': 'publish',
              'states': {
                'default': {
                  'icon': 'Share',
                  'label': 'Publish'
                },
                'working': {
                  'icon': 'Spinner',
                  'label': 'Publishing'
                }
              }
            }
          ],
          'criteria': {
            'path': '$.type',
            'value': 'message'
          },
          'name': 'JSON',
          'src': 'file:///C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/app/' +
            'main/node_modules/@bfemulator/extension-json/index.html',
          'summaryText': [
            'attachments.0.contentType',
            'text'
          ]
        }
      ]
    },
    'name': 'JSON',
    'node': {}
  }
];
ExtensionManager.addExtension(mockExtensions[0], '1234');
jest.mock('./inspector.scss', () => ({}));
jest.mock('../../../../../platform/settings/settingsService', () => ({
  SettingsService: {
    emulator: {
      cwdAsBase: ''
    }
  }
}));
describe('The Inspector component should', () => {
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
      <InspectorContainer document={ mockState.document } inspector={ { src } }/>
    </Provider>);

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
});
