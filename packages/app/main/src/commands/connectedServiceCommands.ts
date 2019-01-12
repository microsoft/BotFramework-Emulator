import { SharedConstants } from "@bfemulator/app-shared";
import { CommandRegistry } from "@bfemulator/sdk-shared";
import {
  IConnectedService,
  ServiceTypes
} from "botframework-config/lib/schema";

import { mainWindow } from "../main";
import { CosmosDbApiService } from "../services/cosmosDbApiService";
import { LuisApi } from "../services/luisApiService";
import { QnaApiService } from "../services/qnaApiService";
import { StorageAccountApiService } from "../services/storageAccountApiService";

const { ConnectedService, UI } = SharedConstants.Commands;

export function registerCommands(commandRegistry: CommandRegistry) {
  // Retrieves the list of luis services
  commandRegistry.registerCommand(
    ConnectedService.GetConnectedServicesByType,
    async (
      armToken: string,
      serviceType: ServiceTypes
    ): Promise<{ services: IConnectedService[] }> => {
      let it;
      switch (serviceType) {
        case ServiceTypes.Luis:
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
          throw new TypeError(
            `The ServiceTypes ${serviceType} is not a known service type`
          );
      }

      let result: { services: IConnectedService[] };
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
          if (
            typeof result === "object" &&
            "label" in result &&
            "progress" in result
          ) {
            await mainWindow.commandService.remoteCall(
              UI.UpdateProgressIndicator,
              result
            );
          }
        } catch (e) {
          break;
        }
      }
      result.services = result.services.filter(
        service => service.type === serviceType
      );
      return result;
    }
  );
}
