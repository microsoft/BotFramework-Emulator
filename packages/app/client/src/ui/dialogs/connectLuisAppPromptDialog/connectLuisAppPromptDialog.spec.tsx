import * as React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { createStore } from 'redux';
import { azureAuth } from '../../../data/reducer/azureAuthReducer';
import { ConnectLuisAppPromptDialog } from './connectLuisAppPromptDialog';
import { ConnectLuisAppPromptDialogContainer } from './connectLuisAppPromptDialogContainer';
import { DialogService } from '../service';

jest.mock('../service', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  }
}));

jest.mock('../dialogStyles.scss', () => ({}));

jest.mock('../../dialogs/', () => ({
  AzureLoginPromptDialogContainer: () => undefined,
  AzureLoginSuccessDialogContainer: () => undefined,
  BotCreationDialog: () => undefined,
  DialogService: { showDialog: () => Promise.resolve(true) },
  SecretPromptDialog: () => undefined
}));

describe('The ConnectLuisAppPromptDialog component should', () => {
  let parent;
  let node;

  beforeEach(() => {
    parent = mount(<Provider store={ createStore(azureAuth) }>
      <ConnectLuisAppPromptDialogContainer />
    </Provider>);
    node = parent.find(ConnectLuisAppPromptDialog);
  });

  it('should render deeply', () => {
    expect(parent.find(ConnectLuisAppPromptDialogContainer)).not.toBe(null);
  });

  it('should contain both a cancel and confirm function in the props', () => {
    const prompt = parent.find(ConnectLuisAppPromptDialog);
    expect(typeof (prompt.props() as any).cancel).toBe('function');
    expect(typeof (prompt.props() as any).confirm).toBe('function');
  });

  it('should exit with code 0 when the user cancels the dialog', () => {
    const spy = jest.spyOn(DialogService, 'hideDialog');
    const instance = node.instance();
    instance.props.cancel();
    expect(spy).toHaveBeenCalledWith(0);
  });

  it('should exit with code 1 when the confirmation is selected', () => {
    const spy = jest.spyOn(DialogService, 'hideDialog');
    const instance = node.instance();
    instance.props.confirm();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('should exit with code 2 when add luis apps manually is selected', () => {
    const spy = jest.spyOn(DialogService, 'hideDialog');
    const instance = node.instance();
    instance.props.addLuisAppManually();
    expect(spy).toHaveBeenCalledWith(2);
  });
});
