import * as React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { GetStartedWithLuisDialogContainer } from './getStartedWithLuisDialogContainer';
import { createStore } from 'redux';
import azureAuth from '../../../data/reducer/azureAuthReducer';
import { GetStartedWithLuisDialog } from './getStartedWithLuisDialog';
import store from '../../../data/store';
import { azureArmTokenDataChanged } from '../../../data/action/azureAuthActions';

jest.mock('./getStartedWithLuisDialog.scss', () => ({}));
jest.mock('../service', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  }
}));

describe('The GetStartedWithLuisDialog component should', () => {

  beforeEach(() => {
    store.dispatch(azureArmTokenDataChanged('fdsafsdafsa.eyJ1cG4iOiJub25lQG5vbmUuY29tIn0='));
  });

  it('should render deeply', () => {
    const parent = mount(<Provider store={ createStore(azureAuth) }>
      <GetStartedWithLuisDialogContainer/>
    </Provider>);
    expect(parent.find(GetStartedWithLuisDialogContainer)).not.toBe(null);
  });

  it('should contain both a cancel and confirm function in the props', () => {
    const parent = mount(<Provider store={ createStore(azureAuth) }>
      <GetStartedWithLuisDialogContainer/>
    </Provider>);

    const prompt = parent.find(GetStartedWithLuisDialog);
    expect(typeof (prompt.props() as any).cancel).toBe('function');
    expect(typeof (prompt.props() as any).confirm).toBe('function');
    expect(typeof (prompt.props() as any).addLuisAppManually).toBe('function');
  });
});
