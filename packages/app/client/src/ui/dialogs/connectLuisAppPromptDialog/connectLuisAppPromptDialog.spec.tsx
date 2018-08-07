import * as React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { createStore } from 'redux';
import azureAuth from '../../../data/reducer/azureAuthReducer';
import { ConnectLuisAppPromptDialog } from './connectLuisAppPromptDialog';
import { ConnectLuisAppPromptDialogContainer } from './connectLuisAppPromptDialogContainer';

jest.mock('./connectLuisAppPromptDialog.scss', () => ({}));
jest.mock('../service', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  }
}));
describe('The ConnectLuisAppPromptDialog component should', () => {

  it('should render deeply', () => {
    const parent = mount(<Provider store={ createStore(azureAuth) }>
      <ConnectLuisAppPromptDialogContainer/>
    </Provider>);
    expect(parent.find(ConnectLuisAppPromptDialogContainer)).not.toBe(null);
  });

  it('should contain both a cancel and confirm function in the props', () => {
    const parent = mount(<Provider store={ createStore(azureAuth) }>
      <ConnectLuisAppPromptDialogContainer/>
    </Provider>);

    const prompt = parent.find(ConnectLuisAppPromptDialog);
    expect(typeof (prompt.props() as any).cancel).toBe('function');
    expect(typeof (prompt.props() as any).confirm).toBe('function');
  });
});
