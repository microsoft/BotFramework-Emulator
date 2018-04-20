import { azureBotServiceSagas } from './azureBotServiceSagas';
import { dispatchSagas } from './dispatchSagas';
import { endpointSagas } from './endpointSagas';
import { luisSagas } from './luisSagas';
import { qnaMakerSagas } from './qnaMakerSagas';

export const applicationSagas = [
  luisSagas,
  qnaMakerSagas,
  dispatchSagas,
  endpointSagas,
  azureBotServiceSagas
];
