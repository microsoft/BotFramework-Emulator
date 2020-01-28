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
import { SharedConstants } from '@bfemulator/app-shared';
import { Command, CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';
import { IConnectedService, ServiceTypes } from 'botframework-config/lib/schema';

import { CosmosDbApiService } from '../services/cosmosDbApiService';
import { LuisApi } from '../services/luisApiService';
import { QnaApiService } from '../services/qnaApiService';
import { StorageAccountApiService } from '../services/storageAccountApiService';

const { ConnectedService, UI } = SharedConstants.Commands;

export class ConnectedServiceCommands {
  @CommandServiceInstance()
  private commandService: CommandServiceImpl;

  // Retrieves the list of luis services
  @Command(ConnectedService.GetConnectedServicesByType)
  protected async getConnectedServicesByType(
    armToken: string,
    serviceType: ServiceTypes
  ): Promise<{ services: IConnectedService[] }> {
    let it;
    switch (serviceType) {
      case ServiceTypes.Luis:
      // Falls through

      case ServiceTypes.Dispatch:
        it = LuisApi.getServices(armToken);
        break;

      case ServiceTypes.QnA:
        it = QnaApiService.getKnowledgeBases(armToken);
        break;

      case ServiceTypes.BlobStorage:
        it = StorageAccountApiService.getBlobStorageServices(armToken);
        break;

      case ServiceTypes.CosmosDB:
        it = CosmosDbApiService.getCosmosDbServices(armToken);
        break;

      default:
        throw new TypeError(`The ServiceTypes ${serviceType} is not a known service type`);
    }

    let result: { services: IConnectedService[] };
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const next = it.next(result);
      if (next.done) {
        result = next.value;
        break;
      }
      try {
        result = await next.value;
        // Signature for a progress update that needs to
        // be sent to the rendering process
        if (typeof result === 'object' && 'label' in result && 'progress' in result) {
          await this.commandService.remoteCall(UI.UpdateProgressIndicator, result);
        }
      } catch (e) {
        break;
      }
    }
    result.services = result.services.filter(service => service.type === serviceType);
    return result;
  }
}
