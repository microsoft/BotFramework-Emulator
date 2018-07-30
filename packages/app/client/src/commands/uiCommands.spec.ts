const mockBotCreationDialog = class MockBotCreationDialog {
};
const mockSecretPromptDialog = class MockSecretPromptDialog {
};
const mockALPDC = class MockALPDC {
};
const mockALSDC = class MockALSDC {
};
jest.mock('../data/editorHelpers', () => ({
  showWelcomePage: () => Promise.resolve(true)
}));
jest.mock('../ui/dialogs', () => ({
    AzureLoginPromptDialogContainer: mockALPDC,
    AzureLoginSuccessDialogContainer: mockALSDC,
    BotCreationDialog: mockBotCreationDialog,
    DialogService: { showDialog: () => Promise.resolve(true) },
    SecretPromptDialog: mockSecretPromptDialog
  }
));
import { EditorActions, OpenEditorAction } from '../data/action/editorActions';
import * as Constants from '../constants';
import { CONTENT_TYPE_APP_SETTINGS, DOCUMENT_ID_APP_SETTINGS } from '../constants';
import { NavBarActions, SelectNavBarAction } from '../data/action/navBarActions';
import { DialogService,
  AzureLoginPromptDialogContainer,
  AzureLoginSuccessDialogContainer,
  BotCreationDialog,
  SecretPromptDialog } from '../ui/dialogs';
import { CommandRegistryImpl } from '@bfemulator/sdk-shared';
import { SharedConstants } from '@bfemulator/app-shared';
import { registerCommands } from './uiCommands';
import * as helpers from '../data/editorHelpers';
import store from '../data/store';
import { AzureAuthAction, AzureAuthWorkflow } from '../data/action/azureAuthActions';
const Commands = SharedConstants.Commands.UI;

describe('the uiCommands', () => {
  let registry: CommandRegistryImpl;
  beforeAll(() => {
    registry = new CommandRegistryImpl();
    registerCommands(registry);
  });

  it('should show the welcome page when the ShowWelcomePage command is dispatched', () => {
    const spy = jest.spyOn(helpers, 'showWelcomePage');
    registry.getCommand(Commands.ShowWelcomePage).handler();
    expect(spy).toHaveBeenCalled();
  });

  it('should call DialogService.showDialog when the ShowBotCreationDialog command is dispatched', async () => {
    const spy = jest.spyOn(DialogService, 'showDialog');
    const result = await registry.getCommand(Commands.ShowBotCreationDialog).handler();
    expect(spy).toHaveBeenCalledWith(BotCreationDialog);
    expect(result).toBe(true);
  });

  it('should call DialogService.showDialog when the ShowSecretPromptDialog command is dispatched', async () => {
    const spy = jest.spyOn(DialogService, 'showDialog');
    const result = await registry.getCommand(Commands.ShowSecretPromptDialog).handler();
    expect(spy).toHaveBeenCalledWith(SecretPromptDialog);
    expect(result).toBe(true);
  });

  describe('should dispatch the apporpriate action to the store', () => {
    it('when the SwitchNavBarTab command is dispatched', () => {
      let arg: SelectNavBarAction = {} as SelectNavBarAction;
      store.dispatch = action => arg = action;
      registry.getCommand(Commands.SwitchNavBarTab).handler('Do it Nauuuw!');
      expect(arg.type).toBe(NavBarActions.select);
      expect(arg.payload.selection).toBe('Do it Nauuuw!');
    });

    it('when the ShowExplorer command is dispatched', () => {
      let arg: SelectNavBarAction = {} as SelectNavBarAction;
      store.dispatch = action => arg = action;
      registry.getCommand(Commands.ShowExplorer).handler();
      expect(arg.type).toBe(NavBarActions.select);
      expect(arg.payload.selection).toBe(Constants.NAVBAR_BOT_EXPLORER);
    });

    it('when the ShowServices command is dispatched', () => {
      let arg: SelectNavBarAction = {} as SelectNavBarAction;
      store.dispatch = action => arg = action;
      registry.getCommand(Commands.ShowServices).handler();
      expect(arg.type).toBe(NavBarActions.select);
      expect(arg.payload.selection).toBe(Constants.NAVBAR_SERVICES);
    });

    it('when the ShowAppSettings command is dispatched', () => {
      let arg: OpenEditorAction = {} as OpenEditorAction;
      store.dispatch = action => arg = action;
      registry.getCommand(Commands.ShowAppSettings).handler();
      expect(arg.type).toBe(EditorActions.open);
      expect(arg.payload.contentType).toBe(CONTENT_TYPE_APP_SETTINGS);
      expect(arg.payload.documentId).toBe(DOCUMENT_ID_APP_SETTINGS);
      expect(arg.payload.isGlobal).toBe(true);
    });

    it('when the SignInToAzure command is dispatched', async () => {
      let arg: AzureAuthAction<AzureAuthWorkflow> = {} as AzureAuthAction<AzureAuthWorkflow>;
      store.dispatch = action => arg = action;
      registry.getCommand(Commands.SignInToAzure).handler();
      expect(arg.payload.loginSuccessDialog).toBe(AzureLoginSuccessDialogContainer);
      expect(arg.payload.promptDialog).toBe(AzureLoginPromptDialogContainer);
    });
  });

  it('should set the proper href on the theme tag when the SwitchTheme command is dispatched', () => {
    let link = document.createElement('link');
    link.id = 'themeVars';
    document.querySelector('head').appendChild(link);
    registry.getCommand(Commands.SwitchTheme).handler('./light.css');
    expect(link.href).toBe('./light.css');
  });
});
