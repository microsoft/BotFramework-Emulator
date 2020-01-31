//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';
import { azureArmTokenDataChanged, beginAzureAuthWorkflow, SharedConstants } from '@bfemulator/app-shared';
import { ServiceTypes } from 'botframework-config/lib/schema';

import { store } from '../store';
import {
  AzureLoginFailedDialogContainer,
  AzureLoginPromptDialogContainer,
  AzureLoginSuccessDialogContainer,
  DialogService,
} from '../../ui/dialogs';

import { azureAuthSagas } from './azureAuthSaga';

jest.mock('electron', () => ({
  remote: {
    app: {
      isPackaged: false,
    },
  },
  ipcMain: new Proxy(
    {},
    {
      get(): any {
        return () => ({});
      },
      has() {
        return true;
      },
    }
  ),
  ipcRenderer: new Proxy(
    {},
    {
      get(): any {
        return () => ({});
      },
      has() {
        return true;
      },
    }
  ),
}));

jest.mock('../../ui/dialogs', () => ({
  DialogService: { showDialog: () => Promise.resolve(true) },
}));

describe('The azureAuthSaga', () => {
  let commandService: CommandServiceImpl;
  beforeAll(() => {
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
  });

  it('should contain a single step if the token in the store is valid', () => {
    store.dispatch(azureArmTokenDataChanged('a valid access_token'));

    const it = azureAuthSagas()
      .next()
      .value.FORK.args[1]({
        payload: 'blargh',
      });
    let val;
    let ct = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const next = it.next(val);
      if (next.done) {
        break;
      }
      val = next.value;
      if ('SELECT' in val) {
        val = val.SELECT.selector(store.getState());
        expect(val.access_token).toBe('a valid access_token');
      }
      ct++;
    }
    expect(ct).toBe(1);
  });

  describe('with an invalid token in the store', () => {
    it('should contain just 2 steps when the Azure login dialog prompt is canceled', async () => {
      store.dispatch(azureArmTokenDataChanged(''));
      // @ts-ignore
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
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const next = it.next(val);
        if (next.done) {
          break;
        }
        val = next.value;
        if ('SELECT' in val) {
          val = val.SELECT.selector(store.getState());
          expect(val.access_token).toBe('');
        } else if (val instanceof Promise) {
          val = await val;
          expect(val).toBe(false);
        }
        ct++;
      }

      expect(ct).toBe(2);
    });

    it('should contain 4 steps when the Azure login dialog prompt is confirmed but auth fails', async () => {
      store.dispatch(azureArmTokenDataChanged(''));
      // @ts-ignore
      DialogService.showDialog = () => Promise.resolve(1);
      jest.spyOn(commandService, 'remoteCall').mockResolvedValueOnce(false);
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
      const remoteCallSpy = jest.spyOn(commandService, 'remoteCall').mockResolvedValue(true);
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const next = it.next(val);
        if (next.done) {
          break;
        }
        val = next.value;
        if ('SELECT' in val) {
          val = val.SELECT.selector(store.getState());
          expect(val.access_token).toBe('');
        } else if (val instanceof Promise) {
          val = await val;
          // User has confirmed and wants to sign into Azure
          if (ct === 1) {
            expect(val).toBe(1);
          }
        } else if ('CALL' in val) {
          val = val.CALL.fn.call(null, val.CALL.args);
          if (val[Symbol.toStringTag] === 'Promise') {
            val = await val;
            if (ct === 2) {
              // Login was unsuccessful
              expect(val).toBe(false);
              expect(remoteCallSpy).toHaveBeenCalledWith([SharedConstants.Commands.Azure.RetrieveArmToken]);
            }
          }
        }
        ct++;
      }
      expect(ct).toBe(5);
      expect(remoteCallSpy).toHaveBeenCalledWith(SharedConstants.Commands.Telemetry.TrackEvent, 'azure_signIn', {
        success: false,
      });
    });

    it('should contain 6 steps when the Azure login dialog prompt is confirmed and auth succeeds', async () => {
      store.dispatch(azureArmTokenDataChanged(''));
      // @ts-ignore
      DialogService.showDialog = () => Promise.resolve(1);
      commandService.remoteCall = args => {
        switch (args[0]) {
          case SharedConstants.Commands.Azure.RetrieveArmToken:
            // eslint-disable-next-line typescript/camelcase
            return Promise.resolve({ access_token: 'a valid access_token' });

          case SharedConstants.Commands.Azure.PersistAzureLoginChanged:
            return Promise.resolve({ persistLogin: true });

          default:
            return Promise.resolve(false) as any;
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
      const remoteCallSpy = jest.spyOn(commandService, 'remoteCall');
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const next = it.next(val);
        if (next.done) {
          break;
        }
        val = next.value;
        if ('SELECT' in val) {
          val = val.SELECT.selector(store.getState());
          expect(val.access_token).toBe('');
        } else if (val instanceof Promise) {
          val = await val;
          // User has confirmed and wants to sign into Azure
          if (ct === 1) {
            expect(val).toBe(1);
          }
        } else if ('CALL' in val) {
          val = val.CALL.fn.call(null, val.CALL.args);
          if (val[Symbol.toStringTag] === 'Promise') {
            val = await val;
            if (ct === 3) {
              // Login was successful
              expect(val.access_token).toBe('a valid access_token');
              expect(remoteCallSpy).toHaveBeenCalledWith([SharedConstants.Commands.Azure.RetrieveArmToken]);
            } else if (ct === 5) {
              expect(val.persistLogin).toBe(true);
              expect(remoteCallSpy).toHaveBeenCalledWith([SharedConstants.Commands.Azure.PersistAzureLoginChanged, 1]);
            }
          }
        } else if ('PUT' in val) {
          store.dispatch(val.PUT.action);
        }
        ct++;
      }
      expect(ct).toBe(6);
      expect(store.getState().azureAuth.access_token).toBe('a valid access_token');
      expect(remoteCallSpy).toHaveBeenCalledWith(SharedConstants.Commands.Telemetry.TrackEvent, 'azure_signIn', {
        persistLogin: true,
        success: true,
      });
    });
  });
});
