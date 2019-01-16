import { SharedConstants } from '@bfemulator/app-shared';
import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { azureArmTokenDataChanged } from '../../../data/action/azureAuthActions';
import * as BotActions from '../../../data/action/botActions';
import { azureAuth } from '../../../data/reducer/azureAuthReducer';
import { bot } from '../../../data/reducer/bot';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';
import { WelcomePage } from './welcomePage';
import { WelcomePageContainer } from './welcomePageContainer';

const mockStore = createStore(combineReducers({ azureAuth, bot }));
jest.mock('./welcomePage.scss', () => ({}));
jest.mock('../../layout/genericDocument.scss', () => ({}));
jest.mock('../recentBotsList/recentBotsList.scss', () => ({}));
jest.mock('../../dialogs/dialogStyles.scss', () => ({}));
jest.mock('../../dialogs/openBotDialog/openBotDialog.scss', () => ({}));
jest.mock('../../dialogs', () => ({}));
jest.mock('../../../data/store', () => ({
  get store() {
    return mockStore;
  }
}));

const mockArmToken = 'bm90aGluZw==.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds';
const bots = [
  {
    'path': '/Users/microsoft/Documents/testbot/contoso-cafe-bot.bot',
    'displayName': 'contoso-cafe-bot',
    'transcriptsPath': '/Users/microsoft/Documents/testbot/transcripts',
    'chatsPath': '/Users/microsoft/Documents/testbot/dialogs'
  },
  {
    'path': '/Users/microsoft/Documents/testbot/TestBot.bot',
    'displayName': 'TestBots',
    'transcriptsPath': '/Users/microsoft/Documents/testbot/transcripts',
    'chatsPath': '/Users/microsoft/Documents/testbot/dialogs'
  }
];
describe('The AzureLoginFailedDialogContainer component should', () => {
  let parent;
  let node;
  let instance: any;
  beforeEach(() => {
    mockStore.dispatch(azureArmTokenDataChanged(mockArmToken));
    mockStore.dispatch(BotActions.load(bots));
    parent = mount(<Provider store={ mockStore }>
      <WelcomePageContainer/>
    </Provider>);
    node = parent.find(WelcomePage);
    instance = node.instance() as WelcomePage;
  });

  it('should render deeply', () => {
    expect(parent.find(WelcomePageContainer)).not.toBe(null);
    expect(parent.find(WelcomePage)).not.toBe(null);
  });

  it('should call the appropriate command when a recent bot is clicked', () => {
    const spy = jest.spyOn(CommandServiceImpl, 'call');
    instance.onBotSelected(bots[1]);
    const { Switch } = SharedConstants.Commands.Bot;
    expect(spy).toHaveBeenCalledWith(Switch, '/Users/microsoft/Documents/testbot/TestBot.bot');
  });

  it('should call the appropriate command when onOpenBotClick is called', async () => {
    const spy = jest.spyOn(CommandServiceImpl, 'call');
    await instance.onOpenBotClick();
    expect(spy).toHaveBeenCalledWith(SharedConstants.Commands.UI.ShowOpenBotDialog);
  });
});
