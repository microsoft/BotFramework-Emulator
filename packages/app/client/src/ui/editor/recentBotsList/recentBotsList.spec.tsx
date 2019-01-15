import { newNotification, SharedConstants } from '@bfemulator/app-shared';
import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import * as BotActions from '../../../data/action/botActions';
import { beginAdd } from '../../../data/action/notificationActions';
import { openContextMenuForBot } from '../../../data/action/welcomePageActions';
import { bot } from '../../../data/reducer/bot';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';
import { RecentBotsList } from './recentBotsList';
import { RecentBotsListContainer } from './recentBotsListContainer';

const mockStore = createStore(combineReducers({ bot }));
jest.mock('./recentBotsList.scss', () => ({}));
jest.mock('../../dialogs', () => ({}));
jest.mock('../../dialogs/dialogStyles.scss', () => ({}));
jest.mock('../../dialogs/botCreationDialog/botCreationDialog.scss', () => ({}));
jest.mock('../../dialogs/openBotDialog/openBotDialog.scss', () => ({}));

const bots = [
  {
    'path': '/some/path',
    'displayName': 'mockMock',
    'transcriptsPath': '/Users/microsoft/Documents/testbot/transcripts',
    'chatsPath': '/Users/microsoft/Documents/testbot/dialogs'
  }
];

describe('The RecentBotsList', () => {
  let mockDispatch;
  let node;
  let parent;
  let instance;
  let mockOnBotSelected = jest.fn();

  beforeEach(() => {
    mockStore.dispatch(BotActions.load(bots));
    mockDispatch = jest.spyOn(mockStore, 'dispatch');
    parent = mount(<Provider store={ mockStore }>
      <RecentBotsListContainer onBotSelected={ mockOnBotSelected }/>
    </Provider>);
    node = parent.find(RecentBotsList);
    instance = node.instance();
  });

  it('should dispatch the appropriate action when a context menu is invoked over a bot in the list', () => {
    instance.onBotContextMenu({
      currentTarget: {
        dataset: {
          index: 0
        }
      }
    } as any);

    expect(mockDispatch).toHaveBeenCalledWith(openContextMenuForBot((mockStore.getState() as any).bot.botFiles[0]));
  });

  it ('should send a notification when a bot fails to delete', async () => {
    await instance.onDeleteBotClick({
      currentTarget: {
        dataset: {
          index: 1
        }
      }
    } as any);
    const message = `An Error occurred on the Recent Bots List: TypeError: Cannot read property 'path' of undefined`;
    const notification = beginAdd(newNotification(message));
    notification.payload.notification.timestamp = jasmine.any(Number) as any;
    notification.payload.notification.id = jasmine.any(String) as any;
    expect(mockDispatch).toHaveBeenCalledWith(notification);
  });

  it('should call the appropriate command when a bot from the list is deleted', async () => {
    const spy = jest.spyOn(CommandServiceImpl, 'remoteCall').mockResolvedValue(true);
    await instance.onDeleteBotClick({
      currentTarget: {
        dataset: {
          index: 0
        }
      }
    } as any);
    const { RemoveFromBotList } = SharedConstants.Commands.Bot;
    expect(spy).toHaveBeenCalledWith(RemoveFromBotList, '/some/path');
  });

  it('should call the onBotSelected function passed in the props when a bot it selected from the list', () => {
    instance.onBotClick({
      currentTarget: {
        dataset: {
          index: 0
        }
      }
    } as any);

    expect(mockOnBotSelected).toHaveBeenCalledWith(bots[0]);
  });
});
