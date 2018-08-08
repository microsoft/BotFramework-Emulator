import { CommandRegistry } from '@bfemulator/sdk-shared';

import { SharedConstants } from '@bfemulator/app-shared';
import { LuisApi } from '../services/luisApiService';

const { Luis } = SharedConstants.Commands;

export function registerCommands(commandRegistry: CommandRegistry) {

  commandRegistry.registerCommand(Luis.GetLuisApplications, LuisApi.getApplicationsList);
}
