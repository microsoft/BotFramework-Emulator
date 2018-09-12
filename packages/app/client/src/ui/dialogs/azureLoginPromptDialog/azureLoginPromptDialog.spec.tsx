import * as React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { AzureLoginPromptDialogContainer } from './azureLoginPromptDialogContainer';
import { createStore } from 'redux';
import azureAuth from '../../../data/reducer/azureAuthReducer';
import { AzureLoginPromptDialog } from './azureLoginPromptDialog';

jest.mock('../service', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  }
}));

jest.mock('../../dialogs/', () => ({
  AzureLoginPromptDialogContainer: () => undefined,
  AzureLoginSuccessDialogContainer: () => undefined,
  BotCreationDialog: () => undefined,
  DialogService: { showDialog: () => Promise.resolve(true) },
  SecretPromptDialog: () => undefined
}));

describe('The AzureLoginPromptDialog component should', () => {

  it('should render deeply', () => {
    const parent = mount(<Provider store={ createStore(azureAuth) }>
      <AzureLoginPromptDialogContainer />
    </Provider>);
    expect(parent.find(AzureLoginPromptDialogContainer)).not.toBe(null);
  });

  it('should contain both a cancel and confirm function in the props', () => {
    const parent = mount(<Provider store={ createStore(azureAuth) }>
      <AzureLoginPromptDialogContainer />
    </Provider>);

    const prompt = parent.find(AzureLoginPromptDialog);
    expect(typeof (prompt.props() as any).cancel).toBe('function');
    expect(typeof (prompt.props() as any).confirm).toBe('function');
  });
});
