import { ServiceType } from 'msbot/bin/schema';

export const serviceTypeLabels = {
  [ServiceType.Luis]: 'LUIS',
  [ServiceType.Dispatch]: 'Dispatch',
  [ServiceType.QnA]: 'QnA Maker',
};
