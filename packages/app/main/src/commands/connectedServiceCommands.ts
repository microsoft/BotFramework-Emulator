import { CommandRegistry } from '@bfemulator/sdk-shared';
import { ServiceType } from 'msbot/bin/schema';
import { SharedConstants } from '@bfemulator/app-shared';
import { LuisApi } from '../services/luisApiService';
import { QnaApiService } from '../services/qnaApiService';

const { ConnectedService } = SharedConstants.Commands;

export function registerCommands(commandRegistry: CommandRegistry) {
  // Retrieves the list of luis services
  commandRegistry.registerCommand(ConnectedService.GetConnectedServicesByType,
    (armToken: string, serviceType: ServiceType) => {
    switch (serviceType) {
      case ServiceType.Luis:
      case ServiceType.Dispatch:
        return LuisApi.getServices(armToken);

      case ServiceType.QnA:
        return QnaApiService.getKnowledgeBases(armToken);

      default:
        throw new TypeError(`The ServiceType ${serviceType} is not a know service type`);
    }
  });
}
