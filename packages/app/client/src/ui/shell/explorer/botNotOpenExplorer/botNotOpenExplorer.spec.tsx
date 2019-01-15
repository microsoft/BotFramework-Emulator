import { newNotification, SharedConstants } from '@bfemulator/app-shared';
import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { beginAdd } from '../../../../data/action/notificationActions';
import { bot } from '../../../../data/reducer/bot';
import { chat } from '../../../../data/reducer/chat';
import { CommandServiceImpl } from '../../../../platform/commands/commandServiceImpl';
import { BotNotOpenExplorer } from './botNotOpenExplorer';
import { BotNotOpenExplorerContainer } from './botNotOpenExplorerContainer';

const mockStore = createStore(combineReducers({ bot, chat }), {});

jest.mock('../../../dialogs', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  }
}));

jest.mock('./botNotOpenExplorer.scss', () => ({}));
jest.mock('../../../../data/store', () => ({
  get store() {
    return mockStore;
  }
}));

describe('The EndpointExplorer component should', () => {
  let parent;
  let node;
  let mockDispatch;

  beforeEach(() => {
    mockDispatch = jest.spyOn(mockStore, 'dispatch');
    parent = mount(<Provider store={ mockStore }>
      <BotNotOpenExplorerContainer/>
    </Provider>);
    node = parent.find(BotNotOpenExplorer);
  });

  it('should show the OpenBotDialog when onOpenBotClick is called', async () => {
    const spy = jest.spyOn(CommandServiceImpl, 'call').mockResolvedValue(true);
    const instance = node.instance();
    await instance.onOpenBotClick();

    expect(spy).toHaveBeenCalledWith(SharedConstants.Commands.UI.ShowOpenBotDialog);
  });

  it('should send a notification if the call to onOpenBotClick fails', async () => {
    const commandServiceSpy = jest.spyOn(CommandServiceImpl, 'call').mockRejectedValue('oh noes!');
    const instance = node.instance();
    await instance.onOpenBotClick();
    const message = `An Error occurred on the Bot Not Open Explorer: oh noes!`;
    const notification = newNotification(message);
    const action = beginAdd(notification);
    notification.timestamp = jasmine.any(Number) as any;
    notification.id = jasmine.any(String) as any;
    expect(mockDispatch).toHaveBeenLastCalledWith(action);

    expect(commandServiceSpy).toHaveBeenLastCalledWith(SharedConstants.Commands.UI.ShowOpenBotDialog);
  });
});
