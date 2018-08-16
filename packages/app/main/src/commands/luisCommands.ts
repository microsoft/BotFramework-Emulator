import { CommandRegistry } from '@bfemulator/sdk-shared';

import { SharedConstants } from '@bfemulator/app-shared';
import { LuisApi } from '../services/luisApiService';

const { Luis } = SharedConstants.Commands;

export function registerCommands(commandRegistry: CommandRegistry) {
  // Retrieves the list of luis services
  commandRegistry.registerCommand(Luis.GetLuisServices, LuisApi.getServices);
}
