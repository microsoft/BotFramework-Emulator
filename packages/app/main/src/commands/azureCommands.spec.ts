import { combineReducers, createStore } from 'redux';
import { CommandRegistryImpl } from '@bfemulator/sdk-shared';
import { registerCommands } from './azureCommands';
import { azureAuth } from '../settingsData/reducers/azureAuthReducer';
import { SharedConstants } from '@bfemulator/app-shared';
import { AzureAuthWorkflowService } from '../services/azureAuthWorkflowService';
import { azureLoggedInUserChanged } from '../settingsData/actions/azureAuthActions';

const mockStore = createStore(combineReducers({ azure: azureAuth }));
const mockArmToken = 'bm90aGluZw==.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds';
jest.mock('../services/azureAuthWorkflowService', () => ({
  AzureAuthWorkflowService: {
    enterAuthWorkflow: function* () {
      yield { armToken:  mockArmToken};
    },

    enterSignOutWorkflow: function*() {
      yield true;
    }
  }
}));
jest.mock('../main', () => ({
  mainWindow: {
    commandService: {
      call: () => Promise.resolve(false)
    }
  }
}));
jest.mock('../settingsData/store', () => ({
  getStore: () => mockStore
}));

describe('The azureCommand,', () => {
  let registry: CommandRegistryImpl;
  beforeAll(() => {
    registry = new CommandRegistryImpl();
    registerCommands(registry);
  });

  describe(`${SharedConstants.Commands.Azure.RetrieveArmToken}, `, () => {
    it('should retrieve the arm token and the user email address and place it in the store', async () => {
      const result = await registry.getCommand(SharedConstants.Commands.Azure.RetrieveArmToken).handler();
      expect(result.armToken).toBe(mockArmToken);
      expect((mockStore.getState() as any).azure.signedInUser).toBe('glasgow@scotland.com');
    });

    it('should return false if the azure auth fails', async () => {
      AzureAuthWorkflowService.retrieveAuthToken = function*() { yield false; } as any;
      const result = await registry.getCommand(SharedConstants.Commands.Azure.RetrieveArmToken).handler();
      expect(result).toBe(false);
    });
  });

  describe(`${SharedConstants.Commands.Azure.SignUserOutOfAzure}, `, () => {
    it('should update the store with an empty string for the signed in user when sign out is successful', async () =>{
      mockStore.dispatch(azureLoggedInUserChanged('none@none.com'));
      expect((mockStore.getState() as any).azure.signedInUser).toBe('none@none.com');
      const result = await registry.getCommand(SharedConstants.Commands.Azure.SignUserOutOfAzure).handler();
      expect(result).toBe(true);
      expect((mockStore.getState() as any).azure.signedInUser).toBe('');
    });

    it('should not remove the signed in user from the store if logout is unsuccessful', async () => {
      AzureAuthWorkflowService.enterSignOutWorkflow = function*() { yield false; } as any;
      mockStore.dispatch(azureLoggedInUserChanged('none@none.com'));
      expect((mockStore.getState() as any).azure.signedInUser).toBe('none@none.com');
      const result = await registry.getCommand(SharedConstants.Commands.Azure.SignUserOutOfAzure).handler();
      expect(result).toBe(false);
      expect((mockStore.getState() as any).azure.signedInUser).toBe('none@none.com');
    });
  });
});
