import { SharedConstants } from '@bfemulator/app-shared';
import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';
import { openContextMenuForBot } from '../action/welcomePageActions';
import { bot } from '../reducer/bot';
import { welcomePageSagas } from './welcomePageSagas';
import sagaMiddlewareFactory from 'redux-saga';
import { applyMiddleware, combineReducers, createStore } from 'redux';

const mockBot = {
  path: '/some/path.bot',
  displayName: 'AuthBot',
  secret: 'secret'
};
jest.mock('../../platform/commands/commandServiceImpl', () => ({
  CommandServiceImpl: {
    remoteCall: async () => null
  }
}));

const sagaMiddleWare = sagaMiddlewareFactory();
const mockStore = createStore(combineReducers({ bot }), {
  bot: { botFiles: [mockBot] }
}, applyMiddleware(sagaMiddleWare));

jest.mock('../store', () => ({
  get store() {
    return mockStore;
  }
}));

sagaMiddleWare.run(welcomePageSagas);
describe('The WelcomePageSagas', () => {

  describe(', when invoking a context menu over a bot in the list', () => {

    it('should call the series of commands that move the bot file to a new location.', async () => {
      const remoteCalls = [];
      CommandServiceImpl.remoteCall = async function (...args: any[]) {
        remoteCalls.push(args);
        switch (args[0]) {

          case SharedConstants.Commands.Electron.DisplayContextMenu:
            return { id: 0 };

          case SharedConstants.Commands.Electron.ShowSaveDialog:
            return 'this/is/a/new/location.bot';

          default:
            return null;
        }
      };
      await mockStore.dispatch(openContextMenuForBot(mockBot));
      await Promise.resolve(true);
      expect(remoteCalls[0]).toEqual([
        'electron:display-context-menu',
        [
          {
            'label': 'Move...',
            'id': 0
          },
          {
            'label': 'Open file location',
            'id': 1
          },
          {
            'label': 'Forget this bot',
            'id': 2
          }
        ]
      ]);
      expect(remoteCalls[1]).toEqual([
        'shell:showExplorer-save-dialog',
        {
          'defaultPath': '/some/path.bot',
          'buttonLabel': 'Move',
          'nameFieldLabel': 'Name',
          'filters': [
            {
              'extensions': [
                '.bot'
              ]
            }
          ]
        }
      ]);

      expect(remoteCalls[2]).toEqual([
        'shell:rename-file',
        {
          'path': '/some/path.bot',
          'newPath': 'this/is/a/new/location.bot'
        }
      ]);

      expect(remoteCalls[3]).toEqual([
        'bot:list:patch',
        '/some/path.bot',
        {
          'path': 'this/is/a/new/location.bot',
          'displayName': 'AuthBot',
          'secret': 'secret'
        }
      ]);
    });
  });
});
