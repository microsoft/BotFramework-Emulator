import * as React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { GetStartedWithLuisDialogContainer } from './getStartedWithLuisDialogContainer';
import { createStore, combineReducers } from 'redux';
import azureAuth from '../../../data/reducer/azureAuthReducer';
import { GetStartedWithLuisDialog } from './getStartedWithLuisDialog';
import { azureArmTokenDataChanged } from '../../../data/action/azureAuthActions';

jest.mock('./getStartedDialog.scss', () => ({}));
jest.mock('../service', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  }
}));

describe('The GetStartedWithLuisDialog component should', () => {
  let mockStore;
  let parent;
  beforeEach(() => {
    const mockArmToken = 'bm90aGluZw==.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds';
    mockStore = createStore(combineReducers({ azureAuth }));
    mockStore.dispatch(azureArmTokenDataChanged(mockArmToken));
    parent = mount(<Provider store={ mockStore }>
      <GetStartedWithLuisDialogContainer/>
    </Provider>);
  });

  it('should render deeply', () => {
    expect(parent.find(GetStartedWithLuisDialogContainer)).not.toBe(null);
  });

  it('should contain both a cancel and confirm function in the props', () => {
    const prompt = parent.find(GetStartedWithLuisDialog);
    expect(typeof (prompt.props() as any).cancel).toBe('function');
    expect(typeof (prompt.props() as any).confirm).toBe('function');
    expect(typeof (prompt.props() as any).addLuisAppManually).toBe('function');
  });
});
