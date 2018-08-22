import {
  AzureLoginFailedDialogContainer,
  AzureLoginSuccessDialogContainer,
  ConnectLuisAppPromptDialogContainer,
  GetStartedWithLuisDialogContainer
} from '../../ui/dialogs';
import { DialogService } from '../../ui/dialogs/service'; // ☣☣ careful! ☣☣
import { ConnectedServiceEditorContainer } from '../../ui/shell/explorer/servicesExplorer/connectedServiceEditor';
import { ConnectedServicePickerContainer } from '../../ui/shell/explorer/servicesExplorer';
import { combineReducers, createStore } from 'redux';
import { servicesExplorerSagas } from './servicesExplorerSagas';
import azureAuth from '../reducer/azureAuthReducer';
import bot from '../reducer/bot';
import { azureArmTokenDataChanged } from '../action/azureAuthActions';
import {
  ConnectedServiceAction,
  ConnectedServicePayload,
  ConnectedServicePickerPayload,
  launchConnectedServicePicker,
  openAddServiceContextMenu,
  openContextMenuForConnectedService
} from '../action/connectedServiceActions';
import { SharedConstants } from '@bfemulator/app-shared';
import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';
import { load, setActive } from '../action/botActions';
import { ServiceType } from 'msbot/bin/schema';

const mockStore = createStore(combineReducers({ azureAuth, bot }));
const mockArmToken = 'bm90aGluZw==.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds';

jest.mock('../../ui/dialogs', () => ({
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

jest.mock('../../ui/shell/explorer/servicesExplorer/connectedServiceEditor', () => ({
  ConnectedServiceEditorContainer: function mock() {
    return undefined;
  }
}));

jest.mock('../../ui/shell/explorer/servicesExplorer', () => ({
  ConnectedServicePicker: function mock() {
    return undefined;
  }
}));

jest.mock('../store', () => ({
  get store() {
    return mockStore;
  }
}));

jest.mock('./azureAuthSaga', () => ({
  getArmToken: function* () {
    yield { access_token: mockArmToken };
  }
}));

CommandServiceImpl.remoteCall = async function (type: string) {
  switch (type) {
    case SharedConstants.Commands.Luis.GetLuisServices:
      return { luisServices: [{ id: 'a luis service' }] };

    default:
      return null;
  }
};

describe('The ServiceExplorerSagas', () => {
  describe(' launchConnectedServicePicker happy path', () => {
    let launchConnectedServicePickerGen;
    let payload: ConnectedServicePickerPayload;

    beforeEach(() => {
      payload = {
        azureAuthWorkflowComponents: {
          loginFailedDialog: AzureLoginFailedDialogContainer,
          loginSuccessDialog: AzureLoginSuccessDialogContainer,
          promptDialog: ConnectLuisAppPromptDialogContainer
        },
        getStartedDialog: GetStartedWithLuisDialogContainer,
        editorComponent: ConnectedServiceEditorContainer,
        pickerComponent: ConnectedServicePickerContainer,
      };
      launchConnectedServicePickerGen = servicesExplorerSagas().next().value.FORK.args[1];
      mockStore.dispatch(azureArmTokenDataChanged(mockArmToken));
    });

    it('should retrieve the arm token from the store', () => {
      const token = launchConnectedServicePickerGen().next().value.SELECT.selector(mockStore.getState());
      expect(token.access_token).toBe(mockArmToken);
    });

    it('should prompt the user to login if the armToken does not exist in the store', () => {
      mockStore.dispatch(azureArmTokenDataChanged(''));
      const it = launchConnectedServicePickerGen(launchConnectedServicePicker(payload));
      let token = it.next().value.SELECT.selector(mockStore.getState());
      expect(token.access_token).toBe('');
      token = it.next().value;
      expect(token.access_token).toBe(mockArmToken);
    });

    it('should retrieve the luis models from the API when a valid armToken exists', async () => {
      const action = launchConnectedServicePicker(payload);
      const it = launchConnectedServicePickerGen(action);
      let token = it.next().value.SELECT.selector(mockStore.getState());

      token = it.next(token).value.SELECT.selector(mockStore.getState()); // Delegate to *retrieveLuisServices()
      const result = await it.next(token).value;
      expect(action.payload.authenticatedUser).toBe('glasgow@scotland.com');
      expect(result.luisServices.length).toEqual(1);
      expect(result.luisServices[0].id).toBe('a luis service');
    });

    it('should launch the luis models picklist after the luis models are retrieved', async () => {
      DialogService.showDialog = () => Promise.resolve([{ id: 'a new service to add' }]);
      const action = launchConnectedServicePicker(payload);
      const it = launchConnectedServicePickerGen(action);
      let token = it.next().value.SELECT.selector(mockStore.getState());

      token = it.next(token).value.SELECT.selector(mockStore.getState()); // Delegate to *retrieveLuisServices()
      const luisModels = await it.next(token).value;

      const newModels = await it.next(luisModels).value;
      expect(newModels.length).toBe(1);
      expect(newModels[0].id).toBe('a new service to add');
    });

    it('should add the new models from the picklist to the active bot', async () => {
      const mockBot = JSON.parse(`{
        "name": "TestBot",
        "description": "",
        "secretKey": "",
        "services": [{
            "type": "endpoint",
            "name": "https://testbot.botframework.com/api/messagesv3",
            "id": "https://testbot.botframework.com/api/messagesv3",
            "appId": "51fc2648-1190-44fa-9559-87b11b1d0014",
            "appPassword": "jxZjGcOpyfM4q75vp2paNQd",
            "endpoint": "https://testbot.botframework.com/api/messagesv3"
        }]
      }`);

      mockStore.dispatch(load([mockBot]));
      mockStore.dispatch(setActive(mockBot));

      DialogService.showDialog = () => Promise.resolve([{ id: 'a new service to add' }]);
      const action = launchConnectedServicePicker(payload);
      const it = launchConnectedServicePickerGen(action);
      let token = it.next().value.SELECT.selector(mockStore.getState());

      token = it.next(token).value.SELECT.selector(mockStore.getState()); // Delegate to *retrieveLuisServices()
      const luisModels = await it.next(token).value;

      const newModels = await it.next(luisModels).value;
      const botConfig = it.next(newModels).value.SELECT.selector(mockStore.getState());
      let _type;
      let _args;
      CommandServiceImpl.remoteCall = function (type: string, ...args: any[]) {
        _type = type;
        _args = args;
        return Promise.resolve(true);
      };

      const result = await it.next(botConfig).value;
      expect(result).toBeTruthy();
      expect(_type).toBe(SharedConstants.Commands.Bot.Save);
      expect(_args[0].services[1].id).toBe('a new service to add');
    });
  });

  describe(' openContextMenuForService', () => {
    let contextMenuGen;
    let action: ConnectedServiceAction<ConnectedServicePayload>;
    const mockService = JSON.parse(`{
          "type": "luis",
          "id": "#1",
          "name": "The Bot, the bot, the bot",
          "version": "0.1",
          "appId": "woot!",
          "authoringKey": "keykeykey",
          "subscriptionKey": "secret"
      }`);

    beforeEach(() => {
      const sagaIt = servicesExplorerSagas();
      action = openContextMenuForConnectedService<ConnectedServiceAction<ConnectedServicePayload>>
      (ConnectedServiceEditorContainer, mockService);
      let i = 4;
      while (i--) {
        contextMenuGen = sagaIt.next().value.FORK.args[1];
      }
    });

    it('should open the service deep link when the "open" menu item is selected', async () => {
      CommandServiceImpl.remoteCall = async () => ({ id: 'open' });

      const it = contextMenuGen(action);
      const result = await it.next().value;
      expect(result.id).toBe('open');

      let link = '';
      CommandServiceImpl.remoteCall = async (type: string, ...args: any[]) => {
        link = args[0];
      };
      await it.next(result).value;

      expect(link).toBe(`https://www.luis.ai/applications/${mockService.appId}/versions/${mockService.version}/build`);
    });

    it('should open the luis editor when the "edit" item is selected', async () => {
      CommandServiceImpl.remoteCall = async () => ({ id: 'edit' });

      const it = contextMenuGen(action);
      const result = await it.next().value;
      expect(result.id).toBe('edit');

      DialogService.showDialog = () => Promise.resolve(mockService);
      CommandServiceImpl.remoteCall = () => Promise.resolve(true);

      const responseFromEditor = await it.next(result).value;
      expect(responseFromEditor).toEqual(mockService);

      const responseFromMain = await it.next(responseFromEditor);
      expect(responseFromMain).toBeTruthy();
    });

    it('should ask the main process to remove the selected luis service from the active bot', async () => {
      CommandServiceImpl.remoteCall = async () => ({ id: 'forget' });
      const it = contextMenuGen(action);
      let result = await it.next().value;
      expect(result.id).toBe('forget');

      let _type;
      let _args;
      CommandServiceImpl.remoteCall = async (type: string, ...args: any[]) => {
        _type = type;
        _args = args;
        return true;
      };

      result = await it.next(result).value;
      expect(result).toBeTruthy();
      expect(_type).toBe(SharedConstants.Commands.Electron.ShowMessageBox);
      expect(_args[1]).toEqual({
        type: 'question',
        buttons: ['Cancel', 'OK'],
        defaultId: 1,
        message: `Remove luis service: The Bot, the bot, the bot. Are you sure?`,
        cancelId: 0,
      });

      result = await it.next(result).value;
      expect(_type).toBe(SharedConstants.Commands.Bot.RemoveService);
      expect(_args[0]).toBe(ServiceType.Luis);
      expect(_args[1]).toBe('#1');
    });

    it('should ask the main process to remove the selected QnA Maker service from the active bot', async () => {
      CommandServiceImpl.remoteCall = async () => ({ id: 'forget' });

      action.payload.connectedService = JSON.parse(`{
          "type": "qna",
          "id": "#1",
          "name": "The Bot, the bot, the bot",
          "version": "0.1",
          "appId": "woot!",
          "authoringKey": "keykeykey",
          "subscriptionKey": "secret"
      }`);

      const it = contextMenuGen(action);
      let result = await it.next().value;
      expect(result.id).toBe('forget');

      let _type;
      let _args;
      CommandServiceImpl.remoteCall = async (type: string, ...args: any[]) => {
        _type = type;
        _args = args;
        return true;
      };

      result = await it.next(result).value;
      expect(result).toBeTruthy();
      expect(_type).toBe(SharedConstants.Commands.Electron.ShowMessageBox);
      expect(_args[1]).toEqual({
        type: 'question',
        buttons: ['Cancel', 'OK'],
        defaultId: 1,
        message: `Remove qna service: The Bot, the bot, the bot. Are you sure?`,
        cancelId: 0,
      });

      result = await it.next(result).value;
      expect(_type).toBe(SharedConstants.Commands.Bot.RemoveService);
      expect(_args[0]).toBe(ServiceType.QnA);
      expect(_args[1]).toBe('#1');
    });

    it('should ask the main process to remove the selected dispatch Maker service from the active bot', async () => {
      CommandServiceImpl.remoteCall = async () => ({ id: 'forget' });

      action.payload.connectedService = JSON.parse(`{
          "type": "dispatch",
          "id": "#1",
          "name": "The Bot, the bot, the bot",
          "version": "0.1",
          "appId": "woot!",
          "authoringKey": "keykeykey",
          "subscriptionKey": "secret"
      }`);

      const it = contextMenuGen(action);
      let result = await it.next().value;
      expect(result.id).toBe('forget');

      let _type;
      let _args;
      CommandServiceImpl.remoteCall = async (type: string, ...args: any[]) => {
        _type = type;
        _args = args;
        return true;
      };

      result = await it.next(result).value;
      expect(result).toBeTruthy();
      expect(_type).toBe(SharedConstants.Commands.Electron.ShowMessageBox);
      expect(_args[1]).toEqual({
        type: 'question',
        buttons: ['Cancel', 'OK'],
        defaultId: 1,
        message: `Remove dispatch service: The Bot, the bot, the bot. Are you sure?`,
        cancelId: 0,
      });

      result = await it.next(result).value;
      expect(_type).toBe(SharedConstants.Commands.Bot.RemoveService);
      expect(_args[0]).toBe(ServiceType.Dispatch);
      expect(_args[1]).toBe('#1');
    });
  });

  describe(' openAddConnectedServiceContextMenu', () => {
    let action: ConnectedServiceAction<ConnectedServicePickerPayload>;
    let contextMenuGen;
    beforeEach(() => {
      const sagaIt = servicesExplorerSagas();

      const payload = {
        azureAuthWorkflowComponents: {
          loginFailedDialog: AzureLoginFailedDialogContainer,
          loginSuccessDialog: AzureLoginSuccessDialogContainer,
          promptDialog: ConnectLuisAppPromptDialogContainer
        },
        getStartedDialog: GetStartedWithLuisDialogContainer,
        editorComponent: ConnectedServiceEditorContainer,
        pickerComponent: ConnectedServicePickerContainer,
      };

      action = openAddServiceContextMenu(payload);
      let i = 5;
      while (i--) {
        contextMenuGen = sagaIt.next().value.FORK.args[1];
      }
    });

    it('should launch the luis connected service picker workflow when the luis menu item is selected', async () => {
      CommandServiceImpl.remoteCall = async () => ({ id: ServiceType.Luis });
      const it = contextMenuGen(action);
      let result = await it.next().value;

      expect(result.id).toBe(ServiceType.Luis);

      result = it.next(result).value.SELECT.selector(mockStore.getState()); // Indicates we've entered the workflow
      expect(result.access_token).toBe(mockArmToken);
    });
  });
});
