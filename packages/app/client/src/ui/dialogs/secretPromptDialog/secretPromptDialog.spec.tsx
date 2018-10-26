import * as React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { combineReducers, createStore } from 'redux';
import { bot } from '../../../data/reducer/bot';
import { BotConfigWithPathImpl } from '@bfemulator/sdk-shared';
import { setActive } from '../../../data/action/botActions';
import { SecretPromptDialogContainer } from './secretPromptDialogContainer';
import { SecretPromptDialog } from './secretPromptDialog';
import { DialogService } from '../service';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';
import { SharedConstants } from '@bfemulator/app-shared';

const mockStore = createStore(combineReducers({ bot }));
const mockBot = BotConfigWithPathImpl.fromJSON({});

jest.mock('../../../platform/commands/commandServiceImpl', () => ({
  CommandServiceImpl: {
    remoteCall: async () => true
  }
}));

jest.mock('../dialogStyles.scss', () => ({}));

jest.mock('./secretPromptDialog.scss', () => ({}));
jest.mock('../../../data/store', () => ({
  get store() {
    return mockStore;
  }
}));

jest.mock('../service', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  }
}));

jest.mock('../../../utils', () => ({
  generateBotSecret: () => {
    return Math.random() + '';
  }
}));

describe('The Secret prompt dialog should', () => {
  let parent;
  let node;
  beforeEach(() => {
    mockStore.dispatch(setActive(mockBot));
    parent = mount(<Provider store={ mockStore }>
      <SecretPromptDialogContainer />
    </Provider>);
    node = parent.find(SecretPromptDialog);
  });

  it('should render deeply', () => {
    expect(parent.find(SecretPromptDialogContainer)).not.toBe(null);
    expect(parent.find(SecretPromptDialog)).not.toBe(null);
  });

  it('should contain the expected functions in the props', () => {
    expect(typeof (node.props() as any).onAnchorClick).toBe('function');
    expect(typeof (node.props() as any).onCancelClick).toBe('function');
    expect(typeof (node.props() as any).onSaveClick).toBe('function');
  });

  it('should update the state when the reveal key is clicked', () => {
    const instance = node.instance();
    expect(instance.state.revealSecret).toBeFalsy();
    instance.onRevealSecretClick();
    expect(instance.state.revealSecret).toBeTruthy();
  });

  it('should update the state when a secret is input by the user', () => {
    const instance = node.instance();
    instance.onChangeSecret('shhh!');
    expect(instance.state.secret).toBe('shhh!');
  });

  it('should call DialogService.hideDialog with the new secrete when the save button is clicked', () => {
    const spy = jest.spyOn(DialogService, 'hideDialog');
    const instance = node.instance();
    instance.onChangeSecret('shhh!');
    instance.onSaveClick();

    expect(spy).toHaveBeenCalledWith('shhh!');
  });

  it('should call DialogService.hideDialog with nothing when the cancel button is clicked', () => {
    const spy = jest.spyOn(DialogService, 'hideDialog');
    const instance = node.instance();
    instance.onChangeSecret('shhh!');
    instance.onDismissClick();

    expect(spy).toHaveBeenCalledWith(null);
  });

  it('should make a remote command call when the learn more button is clicked', () => {
    const spy = jest.spyOn(CommandServiceImpl, 'remoteCall');
    const instance = node.instance();
    instance.onLearnMoreClick();
    const url = 'https://github.com/Microsoft/botbuilder-tools/tree/master/packages/MSBot';
    expect(spy).toHaveBeenCalledWith(SharedConstants.Commands.Electron.OpenExternal, url);
  });
});
