import { ServiceTypes } from 'botframework-config/lib/schema';

export const serviceTypeLabels = {
  [ServiceTypes.Luis]: 'LUIS',
  [ServiceTypes.Dispatch]: 'Dispatch',
  [ServiceTypes.QnA]: 'QnA Maker',
};
