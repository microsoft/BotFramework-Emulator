import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import * as Constants from '../../../constants';
import {
  CONTENT_TYPE_APP_SETTINGS,
  CONTENT_TYPE_LIVE_CHAT,
  CONTENT_TYPE_TRANSCRIPT,
  CONTENT_TYPE_WELCOME_PAGE
} from '../../../constants';
import { load, setActive } from '../../../data/action/botActions';
import { closeDocument, newDocument } from '../../../data/action/chatActions';
import * as EditorActions from '../../../data/action/editorActions';
import { setActiveTab } from '../../../data/action/editorActions';
import { bot } from '../../../data/reducer/bot';
import { chat } from '../../../data/reducer/chat';
import { editor } from '../../../data/reducer/editor';
import { presentation } from '../../../data/reducer/presentation';
import { MDIComponent } from './mdi';
import { MDI, MDIProps } from './mdiContainer';

jest.mock('../../dialogs', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  }
}));
jest.mock('../multiTabs/tabbedDocument/leftContentOverlay/leftContentOverlay.scss', () => ({}));
jest.mock('../multiTabs/tabbedDocument/rightContentOverlay/rightContentOverlay.scss', () => ({}));
jest.mock('../multiTabs/tabbedDocument/overlay.scss', () => ({}));
jest.mock('../../layout/genericDocument.scss', () => ({}));
jest.mock('./tab/tab.scss', () => ({}));
jest.mock('../multiTabs/multiTabs.scss', () => ({}));
jest.mock('../multiTabs/tabbedDocument/contentOverlay/contentOverlay.scss', () => ({}));
jest.mock('../multiTabs/tabbedDocument/contentWrapper/contentWrapper.scss', () => ({}));
jest.mock('../multiTabs/tabBar/tabBar.scss', () => ({}));
jest.mock('../../editor/', () => ({
  EditorFactory: () => <div/>
}));

const mockStore = createStore(combineReducers({ bot, chat, editor, presentation }), {});

jest.mock('../../../data/store', () => ({
  get store() {
    return mockStore;
  }
}));
describe('The ServicesExplorer component should', () => {
  let parent;
  let node;
  let dispatchSpy;

  beforeEach(() => {
    const mockBot = JSON.parse(`{
        "name": "TestBot",
        "description": "",
        "padlock": "",
        "services": [{
            "type": "luis",
            "name": "https://testbot.botframework.com/api/messagesv3",
            "id": "https://testbot.botframework.com/api/messagesv3",
            "appId": "51fc2648-1190-44fa-9559-87b11b1d0014",
            "appPassword": "gfdsgdfs56543gbfd564gfsdbvc",
            "endpoint": "https://testbot.botframework.com/api/messagesv3"
        }]
      }`);

    mockStore.dispatch(load([mockBot]));
    mockStore.dispatch(setActive(mockBot));
    mockStore.dispatch(EditorActions.open({
      contentType: Constants.CONTENT_TYPE_LIVE_CHAT,
      documentId: 'mockbot',
      fileName: 'transcrpt.transcript',
      isGlobal: false
    }));
    mockStore.dispatch(newDocument('mockbot', 'livechat', {
      endpointId: 'https://testbot.botframework.com/api/messagesv3'
    }));
    dispatchSpy = jest.spyOn(mockStore, 'dispatch');
    parent = mount(<Provider store={ mockStore }>
      <MDI owningEditor={ Constants.EDITOR_KEY_PRIMARY }/>
    </Provider>);
    node = parent.find(MDIComponent);
  });

  it('should render deeply', () => {
    expect(parent.find(MDI)).not.toBe(null);
    expect(parent.find(MDIComponent)).not.toBe(null);
  });

  it('should contain the expected function in the props', () => {
    const { props }: { props: MDIProps } = node.instance();
    expect(typeof props.closeTab).toBe('function');
    expect(typeof props.setActiveTab).toBe('function');
  });

  it('should get the expected tab label for each of the content types', () => {
    const instance = node.instance();
    const liveChatLabel = instance.getTabLabel({ contentType: CONTENT_TYPE_LIVE_CHAT, documentId: 'mockbot' });
    expect(liveChatLabel).toBe('Live Chat (https://testbot.botframework.com/api/messagesv3)');

    const transcriptLabel = instance.getTabLabel({
      contentType: CONTENT_TYPE_TRANSCRIPT,
      documentId: 'mockbot',
      fileName: 'transcript.transcript'
    });
    expect(transcriptLabel).toBe('transcript.transcript');

    const welcomeLabel = instance.getTabLabel({ contentType: CONTENT_TYPE_WELCOME_PAGE });
    expect(welcomeLabel).toBe('Welcome');

    const appSettingsLabel = instance.getTabLabel({ contentType: CONTENT_TYPE_APP_SETTINGS });
    expect(appSettingsLabel).toBe('Emulator Settings');
  });

  it('should set the active tab when a tab is clicked', () => {
    const instance = node.instance();
    instance.handleTabChange(0);

    expect(dispatchSpy).toHaveBeenCalledWith(setActiveTab(instance.props.tabOrder[0]));
  });

  it('should close the tab when the close button on the tab is clicked', () => {
    const instance = node.instance();
    instance.props.closeTab('mockbot');

    expect(dispatchSpy).toHaveBeenCalledTimes(2);
    expect(dispatchSpy).toHaveBeenLastCalledWith(closeDocument('mockbot'));
  });
});
