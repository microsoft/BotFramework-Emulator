jest.mock("../../ui/dialogs", () => ({
  AzureLoginPromptDialogContainer: () => undefined,
  AzureLoginSuccessDialogContainer: () => undefined,
  BotCreationDialog: () => undefined,
  DialogService: { showDialog: () => Promise.resolve(true) },
  PostMigrationDialogContainer: () => undefined,
  SecretPromptDialog: () => undefined
}));

jest.mock("../../platform/commands/commandServiceImpl", () => ({
  CommandServiceImpl: {
    remoteCall: () => Promise.resolve(true)
  }
}));

import { store } from "../store";
import {
  azureArmTokenDataChanged,
  beginAzureAuthWorkflow
} from "../action/azureAuthActions";
import { azureAuthSagas } from "./azureAuthSaga";
import {
  AzureLoginFailedDialogContainer,
  AzureLoginPromptDialogContainer,
  AzureLoginSuccessDialogContainer,
  DialogService
} from "../../ui/dialogs";
import { CommandRegistryImpl } from "@bfemulator/sdk-shared";
import { CommandServiceImpl } from "../../platform/commands/commandServiceImpl";
import { SharedConstants } from "@bfemulator/app-shared";
import { registerCommands } from "../../commands/uiCommands";
import { ServiceTypes } from "botframework-config/lib/schema";

describe("The azureAuthSaga", () => {
  it("should contain a single step if the token in the store is valid", () => {
    store.dispatch(azureArmTokenDataChanged("a valid access_token"));
    const it = azureAuthSagas()
      .next()
      .value.FORK.args[1]();
    let val = undefined;
    let ct = 0;
    while (true) {
      const next = it.next(val);
      if (next.done) {
        break;
      }
      val = next.value;
      if ("SELECT" in val) {
        val = val.SELECT.selector(store.getState());
        expect(val.access_token).toBe("a valid access_token");
      }
      ct++;
    }
    expect(ct).toBe(1);
  });

  describe("with an invalid token in the store", () => {
    let registry: CommandRegistryImpl;
    beforeAll(() => {
      registry = new CommandRegistryImpl();
      registerCommands(registry);
    });

    it("should contain just 2 steps when the Azure login dialog prompt is canceled", async () => {
      store.dispatch(azureArmTokenDataChanged(""));
      DialogService.showDialog = () => Promise.resolve(false);
      const it = azureAuthSagas()
        .next()
        .value.FORK.args[1](
          beginAzureAuthWorkflow(
            AzureLoginPromptDialogContainer,
            { serviceType: ServiceTypes.Luis },
            AzureLoginSuccessDialogContainer,
            AzureLoginFailedDialogContainer
          )
        );
      let val = undefined;
      let ct = 0;
      while (true) {
        const next = it.next(val);
        if (next.done) {
          break;
        }
        val = next.value;
        if ("SELECT" in val) {
          val = val.SELECT.selector(store.getState());
          expect(val.access_token).toBe("");
        } else if (val instanceof Promise) {
          val = await val;
          expect(val).toBe(false);
        }
        ct++;
      }

      expect(ct).toBe(2);
    });

    it("should contain 4 steps when the Azure login dialog prompt is confirmed but auth fails", async () => {
      store.dispatch(azureArmTokenDataChanged(""));
      DialogService.showDialog = () => Promise.resolve(1);
      (CommandServiceImpl as any).remoteCall = () => Promise.resolve(false);
      const it = azureAuthSagas()
        .next()
        .value.FORK.args[1](
          beginAzureAuthWorkflow(
            AzureLoginPromptDialogContainer,
            { serviceType: ServiceTypes.Luis },
            AzureLoginSuccessDialogContainer,
            AzureLoginFailedDialogContainer
          )
        );
      let val = undefined;
      let ct = 0;
      const remoteCallSpy = jest.spyOn(CommandServiceImpl, "remoteCall");
      while (true) {
        const next = it.next(val);
        if (next.done) {
          break;
        }
        val = next.value;
        if ("SELECT" in val) {
          val = val.SELECT.selector(store.getState());
          expect(val.access_token).toBe("");
        } else if (val instanceof Promise) {
          val = await val;
          // User has confirmed and wants to sign into Azure
          if (ct === 1) {
            expect(val).toBe(1);
          }
        } else if ("CALL" in val) {
          val = val.CALL.fn.call(null, val.CALL.args);
          if (val instanceof Promise) {
            val = await val;
            if (ct === 2) {
              // Login was unsuccessful
              expect(val).toBe(false);
              expect(remoteCallSpy).toHaveBeenCalledWith([
                SharedConstants.Commands.Azure.RetrieveArmToken
              ]);
            }
          }
        }
        ct++;
      }
      expect(ct).toBe(5);
    });

    it("should contain 6 steps when the Azure login dialog prompt is confirmed and auth succeeds", async () => {
      store.dispatch(azureArmTokenDataChanged(""));
      DialogService.showDialog = () => Promise.resolve(1);
      (CommandServiceImpl as any).remoteCall = args => {
        switch (args[0]) {
          case SharedConstants.Commands.Azure.RetrieveArmToken:
            return Promise.resolve({ access_token: "a valid access_token" });

          case SharedConstants.Commands.Azure.PersistAzureLoginChanged:
            return Promise.resolve({ persistLogin: true });

          default:
            return Promise.resolve(false);
        }
      };
      const it = azureAuthSagas()
        .next()
        .value.FORK.args[1](
          beginAzureAuthWorkflow(
            AzureLoginPromptDialogContainer,
            { serviceType: ServiceTypes.Luis },
            AzureLoginSuccessDialogContainer,
            AzureLoginFailedDialogContainer
          )
        );
      let val = undefined;
      let ct = 0;
      const remoteCallSpy = jest.spyOn(CommandServiceImpl, "remoteCall");
      while (true) {
        const next = it.next(val);
        if (next.done) {
          break;
        }
        val = next.value;
        if ("SELECT" in val) {
          val = val.SELECT.selector(store.getState());
          expect(val.access_token).toBe("");
        } else if (val instanceof Promise) {
          val = await val;
          // User has confirmed and wants to sign into Azure
          if (ct === 1) {
            expect(val).toBe(1);
          }
        } else if ("CALL" in val) {
          val = val.CALL.fn.call(null, val.CALL.args);
          if (val instanceof Promise) {
            val = await val;
            if (ct === 2) {
              // Login was successful
              expect(val.access_token).toBe("a valid access_token");
              expect(remoteCallSpy).toHaveBeenCalledWith([
                SharedConstants.Commands.Azure.RetrieveArmToken
              ]);
            } else if (ct === 4) {
              expect(val.persistLogin).toBe(true);
              expect(remoteCallSpy).toHaveBeenCalledWith([
                SharedConstants.Commands.Azure.PersistAzureLoginChanged,
                1
              ]);
            }
          }
        } else if ("PUT" in val) {
          store.dispatch(val.PUT.action);
        }
        ct++;
      }
      expect(ct).toBe(6);
      expect(store.getState().azureAuth.access_token).toBe(
        "a valid access_token"
      );
    });
  });
});
