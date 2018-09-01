import * as React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { combineReducers, createStore } from 'redux';
import bot from '../../../../data/reducer/bot';
import explorer from '../../../../data/reducer/explorer';
import { LuisService } from 'botframework-config/lib/models';
import { ServicesExplorerContainer } from './servicesExplorerContainer';
import { ServicesExplorer } from './servicesExplorer';
import { load, setActive } from '../../../../data/action/botActions';
import {
  openAddServiceContextMenu,
  openContextMenuForConnectedService,
  openServiceDeepLink
} from '../../../../data/action/connectedServiceActions';
import { ConnectedServiceEditorContainer } from './connectedServiceEditor';
import {
  AzureLoginFailedDialogContainer,
  AzureLoginSuccessDialogContainer,
  ConnectLuisAppPromptDialogContainer,
  GetStartedWithCSDialogContainer
} from '../../../dialogs';
import { ConnectedServicePickerContainer } from './connectedServicePicker/connectedServicePickerContainer';

jest.mock('../../../dialogs', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  }
}));

jest.mock('../servicePane/servicePane.scss', () => ({}));
jest.mock('./connectedServicePicker/connectedServicePicker.scss', () => ({}));
jest.mock('./servicesExplorer.scss', () => ({}));

describe('The ServicesExplorer component should', () => {
  let parent;
  let node;
  let mockStore;
  let mockBot;
  let mockDispatch;
  beforeEach(() => {
    mockStore = createStore(combineReducers({ bot, explorer }));
    mockBot = JSON.parse(`{
        "name": "TestBot",
        "description": "",
        "secretKey": "",
        "services": [{
            "type": "luis",
            "name": "https://testbot.botframework.com/api/messagesv3",
            "id": "https://testbot.botframework.com/api/messagesv3",
            "appId": "51fc2648-1190-44fa-9559-87b11b1d0014",
            "appPassword": "jxZjGcOpyfM4q75vp2paNQd",
            "endpoint": "https://testbot.botframework.com/api/messagesv3"
        }]
      }`);
    mockBot.services[0] = new LuisService(mockBot.services[0]);
    mockStore.dispatch(load([mockBot]));
    mockStore.dispatch(setActive(mockBot));
    mockDispatch = jest.spyOn(mockStore, 'dispatch');
    parent = mount(<Provider store={ mockStore }>
      <ServicesExplorerContainer/>
    </Provider>);
    node = parent.find(ServicesExplorer);
  });

  it('should render deeply', () => {
    expect(parent.find(ServicesExplorerContainer)).not.toBe(null);
    expect(parent.find(ServicesExplorer)).not.toBe(null);
  });

  it('should dispatch a request to open a luis deep link when a service is clicked', () => {
    const instance = node.instance();
    instance.onLinkClick({ currentTarget: { dataset: { index: 0 } } });
    expect(mockDispatch).toHaveBeenCalledWith(openServiceDeepLink(mockBot.services[0]));
  });

  it('should dispatch a request to open the context menu when right clicking on a luis service', () => {
    const instance = node.instance();
    const mockLi = document.createElement('li');
    mockLi.setAttribute('data-index', '0');

    instance.onContextMenuOverLiElement(mockLi);
    expect(mockDispatch)
      .toHaveBeenCalledWith(openContextMenuForConnectedService(
        ConnectedServiceEditorContainer, mockBot.services[0]));
  });

  it('should dispatch a request to open the connected service picker when the add icon is clicked', () => {
    const instance = node.instance();
    instance.onAddIconClick(null);

    expect(mockDispatch).toHaveBeenCalledWith(openAddServiceContextMenu({
      azureAuthWorkflowComponents: {
        loginFailedDialog: AzureLoginFailedDialogContainer,
        loginSuccessDialog: AzureLoginSuccessDialogContainer,
        promptDialog: ConnectLuisAppPromptDialogContainer
      },
      getStartedDialog: GetStartedWithCSDialogContainer,
      editorComponent: ConnectedServiceEditorContainer,
      pickerComponent: ConnectedServicePickerContainer,
    }));
  });

  it('should flag newly added services for animation', () => {
    const instance = node.instance();
    const c = Object.getPrototypeOf(instance).constructor;
    const prevState = {
      sortCriteria: 'name',
      services: [{id: 'existingService'}]
    };

    const nextProps = {
      sortCriteria: 'name',
      services: [{id: 'existingService'}, {id: 'newService'}]
    };

    const state = c.getDerivedStateFromProps(nextProps, prevState);
    expect(state.toAnimate.newService).toBe(true);
    expect(state.toAnimate.existingService).toBeUndefined();
  });
});
