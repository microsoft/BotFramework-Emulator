import * as React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { combineReducers, createStore } from 'redux';
import { azureAuth } from '../../../../../data/reducer/azureAuthReducer';
import { ConnectedServiceEditorContainer } from './connectedServiceEditorContainer';
import { ConnectedServiceEditor } from './connectedServiceEditor';
import { DialogService } from '../../../../dialogs/service';
import { LuisService } from 'botframework-config/lib/models';
import { PrimaryButton } from '@bfemulator/ui-react';

jest.mock('../../../../dialogs/service', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  }
}));

jest.mock('../../../../dialogs/', () => ({
  AzureLoginPromptDialogContainer: () => undefined,
  AzureLoginSuccessDialogContainer: () => undefined,
  BotCreationDialog: () => undefined,
  DialogService: { showDialog: () => Promise.resolve(true) },
  SecretPromptDialog: () => undefined
}));

describe('The ConnectedServiceEditor component should', () => {
  let parent;
  let node;
  let mockService;

  beforeEach(() => {
    mockService = JSON.parse(`{
            "type": "luis",
            "id": "b5af3f67-7ec8-444a-ae91-c4f02883c8f4",
            "name": "It's mathmatical!",
            "version": "0.1",
            "appId": "121221",
            "authoringKey": "poo",
            "subscriptionKey": "emoji"
        }`);
    parent = mount(<Provider store={ createStore(combineReducers({ azureAuth })) }>
      <ConnectedServiceEditorContainer connectedService={ mockService }/>
    </Provider>);
    node = parent.find(ConnectedServiceEditor);
  });

  it('should render deeply', () => {
    expect(parent.find(ConnectedServiceEditorContainer)).not.toBe(null);
    expect(parent.find(ConnectedServiceEditor)).not.toBe(null);
  });

  it('should contain a cancel and updateConnectedService functions in the props', () => {
    expect(typeof (node.props() as any).cancel).toBe('function');
    expect(typeof (node.props() as any).updateConnectedService).toBe('function');
  });

  it('should exit with a 0 value when canceled', () => {
    const spy = jest.spyOn(DialogService, 'hideDialog');
    const instance = node.instance();
    instance.props.cancel();
    expect(spy).toHaveBeenCalledWith(0);
  });

  it('should make a copy of the connected service passed in the props', () => {
    const instance = node.instance();
    expect(instance.state.connectedServiceCopy instanceof LuisService).toBeTruthy();
    expect(instance.state.connectedServiceCopy === mockService).toBeFalsy();
  });

  it('should produce an error when a required input field is null', () => {
    const instance = node.instance();
    const mockEvent = { target: { value: '', dataset: { prop: 'name' } } };
    instance.onInputChange(mockEvent as any);
    expect(instance.state.connectedServiceCopy.name).toBe('');
    expect(instance.state.nameError).not.toBeNull();
  });

  it('should exit with the newly edited model when clicking submit', () => {
    const spy = jest.spyOn(DialogService, 'hideDialog');
    const instance = node.instance();
    const mockEvent = { target: { value: 'renamed model', dataset: { prop: 'name' } } };
    instance.onInputChange(mockEvent as any);
    instance.onSubmitClick();
    const mockMock = { ...mockService };
    mockMock.name = 'renamed model';
    expect(spy).toHaveBeenCalledWith([new LuisService(mockMock)]);
  });

  it('should enable the submit button when all required fields have non-null values', () => {
    const instance = node.instance();
    const mockEvent = { target: { value: 'renamed model', dataset: { prop: 'name' } } };
    instance.onInputChange(mockEvent as any);
    mockEvent.target.dataset.prop = 'subscriptionKey';
    mockEvent.target.value = '';
    instance.onInputChange(mockEvent as any); // non-required field
    instance.render();
    const submitBtn = node.find(PrimaryButton);
    expect(submitBtn.props.disabled).toBeFalsy();
  });
});
