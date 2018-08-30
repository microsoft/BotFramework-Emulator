import * as React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { combineReducers, createStore } from 'redux';
import bot from '../../../data/reducer/bot';
import { BotSettingsEditor } from './botSettingsEditor';
import { BotSettingsEditorContainer } from './botSettingsEditorContainer';
import { BotConfigWithPathImpl } from '@bfemulator/sdk-shared';
import { setActive } from '../../../data/action/botActions';
import { SharedConstants } from '@bfemulator/app-shared';

const mockStore = createStore(combineReducers({ bot }));
const mockBot = BotConfigWithPathImpl.fromJSON({});
jest.mock('./botSettingsEditor.scss', () => ({}));
jest.mock('../../../data/store', () => ({
  get default() {
    return mockStore;
  }
}));

jest.mock('../service', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  }
}));

let mockRemoteCommandsCalled = [];
const mockSharedConstants = SharedConstants; // thanks Jest!
jest.mock('../../../platform/commands/commandServiceImpl', () => ({
  CommandServiceImpl: {
    remoteCall: async (commandName: string, ...args: any[]) => {
      mockRemoteCommandsCalled.push({ commandName, args: args });
      switch (commandName) {
        case mockSharedConstants.Commands.File.SanitizeString:
          return args[0];

        case mockSharedConstants.Commands.Electron.ShowSaveDialog:
          return '/test/path';

        default:
          return true;
      }
    }
  }
}));
describe('The BotSettingsEditor dialog should', () => {
  let parent;
  let node;
  beforeEach(() => {
    mockStore.dispatch(setActive(mockBot));
    mockRemoteCommandsCalled.length = 0;
    parent = mount(<Provider store={ mockStore }>
      <BotSettingsEditorContainer/>
    </Provider>);
    node = parent.find(BotSettingsEditor);
  });

  it('should render deeply', () => {
    expect(parent.find(BotSettingsEditorContainer)).not.toBe(null);
    expect(parent.find(BotSettingsEditor)).not.toBe(null);
  });

  it('should contain a cancel function in the props', () => {
    expect(typeof (node.props() as any).cancel).toBe('function');
  });

  it('should update the state when the reveal key is clicked', () => {
    const instance = node.instance();
    expect(instance.state.revealSecret).toBeFalsy();
    instance.onCheckSecretCheckbox();
    expect(instance.state.revealSecret).toBeTruthy();
  });

  describe('onSaveClick', () => {
    it('should make the expected calls when saving a bot from protocol', async () => {
      const instance = node.instance();
      instance.setState({ path: SharedConstants.TEMP_BOT_IN_MEMORY_PATH });
      await instance.onSaveClick();
      expect(mockRemoteCommandsCalled.length).toBe(7);
      [
        {
          'commandName': 'file:sanitize-string',
          'args': [
            ''
          ]
        },
        {
          'commandName': 'shell:showExplorer-save-dialog',
          'args': [
            {
              'filters': [
                {
                  'name': 'Bot Files',
                  'extensions': [
                    'bot'
                  ]
                }
              ],
              'defaultPath': '',
              'showsTagField': false,
              'title': 'Save as',
              'buttonLabel': 'Save'
            }
          ]
        },
        {
          'commandName': 'bot:list:patch',
          'args': [
            'TEMP_BOT_IN_MEMORY',
            {
              'displayName': '',
              'path': '/test/path',
              'secret': ''
            }
          ]
        },
        {
          'commandName': 'bot:save',
          'args': [
            {
              'name': '',
              'description': '',
              'services': [],
              'secretKey': '',
              'path': '/test/path',
              'overrides': null
            }
          ]
        },
        {
          'commandName': 'bot:set-active',
          'args': [
            {
              'name': '',
              'description': '',
              'services': [],
              'secretKey': '',
              'path': '/test/path',
              'overrides': null
            }
          ]
        },
        {
          'commandName': 'menu:update-file-menu',
          'args': []
        },
        {
          'commandName': 'electron:set-title-bar',
          'args': [
            '/test/path'
          ]
        }
      ].forEach((command, index) => expect(mockRemoteCommandsCalled[index]).toEqual(command));
    });

    it('should make the expected calls when saving a bot', async () => {
      const instance = node.instance();
      instance.setState({ path: 'a/test/path' });
      await instance.onSaveClick();
      expect(mockRemoteCommandsCalled.length).toBe(2);
      [
        {
          'commandName': 'bot:list:patch',
          'args': [
            'a/test/path',
            {
              'secret': ''
            }
          ]
        },
        {
          'commandName': 'bot:save',
          'args': [
            {
              'name': '',
              'description': '',
              'services': [],
              'secretKey': '',
              'path': 'a/test/path',
              'overrides': null
            }
          ]
        }
      ].forEach((command, index) => {
        expect(mockRemoteCommandsCalled[index]).toEqual(command);
      });
    });
  });
});
