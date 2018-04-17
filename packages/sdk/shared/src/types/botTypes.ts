
import { IConnectedService } from './serviceTypes';

/** Bot consumed by msbot package */
export interface IBotConfig {
  name: string;
  description: string;
  services: IConnectedService[];
}
