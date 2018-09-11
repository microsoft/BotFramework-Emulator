import * as React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { GetStartedWithCSDialogContainer } from './getStartedWithCSDialogContainer';
import { combineReducers, createStore } from 'redux';
import azureAuth from '../../../data/reducer/azureAuthReducer';
import { GetStartedWithCSDialog } from './getStartedWithCSDialog';
import { azureArmTokenDataChanged } from '../../../data/action/azureAuthActions';
import { ServiceTypes } from 'botframework-config/lib/schema';

jest.mock('../service', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  }
}));

jest.mock('../../dialogs/', () => ({
    AzureLoginPromptDialogContainer: function mock() {
      return undefined;
    },
    AzureLoginSuccessDialogContainer: function mock() {
      return undefined;
    },
    BotCreationDialog: function mock() {
      return undefined;
    },
    DialogService: {
      showDialog: () => Promise.resolve(true)
    },
    SecretPromptDialog: function mock() {
      return undefined;
    }
  }
));

describe('The GetStartedWithCSDialog component should', () => {
  let mockStore;
  let parent;
  const mockArmToken = 'bm90aGluZw==.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds';
  beforeEach(() => {
    mockStore = createStore(combineReducers({ azureAuth }));
    mockStore.dispatch(azureArmTokenDataChanged(mockArmToken));
    parent = mount(
      <Provider store={ mockStore }>
        <GetStartedWithCSDialogContainer serviceType={ ServiceTypes.Luis } />
      </Provider>
    );
  });

  it('should render deeply', () => {
    expect(parent.find(GetStartedWithCSDialogContainer)).not.toBe(null);
  });

  it('should contain both a cancel and confirm function in the props', () => {
    const prompt = parent.find(GetStartedWithCSDialog);
    expect(typeof (prompt.props() as any).cancel).toBe('function');
    expect(typeof (prompt.props() as any).confirm).toBe('function');
    expect(typeof (prompt.props() as any).launchConnectedServiceEditor).toBe('function');
  });

  it('should display luisContent when the ServiceTypes.Luis is provided in the props', () => {
    const prompt = parent.find(GetStartedWithCSDialog);
    expect(prompt.content).toBe(prompt.luisContent);
  });

  it('should display luisContent when the ServiceTypes.Dispatch is provided in the props', () => {
    parent = mount(<Provider store={ mockStore }>
      <GetStartedWithCSDialogContainer serviceType={ ServiceTypes.Dispatch } />
    </Provider>);
    const prompt = parent.find(GetStartedWithCSDialog);
    expect(prompt.content).toBe(prompt.luisContent);
  });

  it('should display qnaContent when the ServiceTypes.QnA is provided in the props', () => {
    parent = mount(<Provider store={ mockStore }>
      <GetStartedWithCSDialogContainer serviceType={ ServiceTypes.QnA } />
    </Provider>);
    const prompt = parent.find(GetStartedWithCSDialog);
    expect(prompt.content).toBe(prompt.qnaContent);
  });

  it('should display the "showNoModelsFoundContent" when specified in the props', () => {
    parent = mount(<Provider store={ mockStore }>
      <GetStartedWithCSDialogContainer serviceType={ ServiceTypes.QnA } showNoModelsFoundContent={ true } />
    </Provider>);
    const prompt = parent.find(GetStartedWithCSDialog);
    expect(prompt.content).toBe(prompt.qnaContent);
  });
});
