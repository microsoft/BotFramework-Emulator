import * as React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { combineReducers, createStore } from 'redux';
import { LuisModelsViewer } from './luisModelsViewer';
import { LuisModelsViewerContainer } from './luisModelsViewerContainer';
import bot from '../../../../../data/reducer/bot';
import { load, setActive } from '../../../../../data/action/botActions';
import { DialogService } from '../../../../dialogs/service';
jest.mock('./luisModelsViewer.scss', () => ({}));
jest.mock('../../../../dialogs/service', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  }
}));
describe('The LuisModelsViewerDialog component should', () => {
  let parent;
  let node;
  let mockStore;
  let mockBot;
  let mockService;
  beforeEach(() => {
    mockStore = createStore(combineReducers({ bot }));
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

    mockStore.dispatch(load([mockBot]));
    mockStore.dispatch(setActive(mockBot));
    mockService = {...mockBot.services[0]};
    mockService.id = 'mock';

    parent = mount(<Provider store={ mockStore }>
      <LuisModelsViewerContainer availableLuisServices={[mockService]} authenticatedUser="bot@bot.com"/>
    </Provider>);
    node = parent.find(LuisModelsViewer);
  });

  it('should render deeply', () => {
    expect(parent.find(LuisModelsViewerContainer)).not.toBe(null);
    expect(parent.find(LuisModelsViewer)).not.toBe(null);
  });

  it('should contain the expected functions in the props', () => {
    expect(typeof (node.props() as any).cancel).toBe('function');
    expect(typeof (node.props() as any).launchLuisEditor).toBe('function');
    expect(typeof (node.props() as any).addLuisModels).toBe('function');
  });

  it('should update the state when a checkbox is clicked', () => {
    const instance = node.instance();
    expect(instance.state.mock).toBeUndefined();
    instance.onChange(mockService);
    expect(instance.state.mock).not.toBeUndefined();
    expect(instance.state.checkAllChecked).toBeTruthy();
  });

  it('should update the state when the check all checkbox is checked', () => {
    const instance = node.instance();
    expect(instance.state.mock).toBeUndefined();
    expect(instance.state.checkAllChecked).toBeFalsy();

    instance.onSelectAllChange(null);
    expect(instance.state.mock).not.toBeUndefined();
    expect(instance.state.checkAllChecked).toBeTruthy();
  });

  it('should exit with a response of 0 when cancel or close is clicked', () => {
    const spy = jest.spyOn(DialogService, 'hideDialog');
    const instance = node.instance();
    instance.props.cancel();

    expect(spy).toHaveBeenCalledWith(0);
  });

  it('should exit with a response of 1 when adding a luis model manually', () => {
    const spy = jest.spyOn(DialogService, 'hideDialog');
    const instance = node.instance();
    instance.props.launchLuisEditor();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('should exit with the list of luis models to add when the user clicks "add"', () => {
    const spy = jest.spyOn(DialogService, 'hideDialog');
    const instance = node.instance();
    instance.state.mock = mockService;
    instance.onAddClick(null);

    expect(spy).toHaveBeenCalledWith([mockService]);
  });

  it('should disable the "Add" button when no luis models have been selected', () => {
    const instance = node.instance();
    expect(instance.addButtonEnabled).toBeFalsy();
  });
});
