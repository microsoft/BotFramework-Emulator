import { IActivity } from '@bfemulator/sdk-shared';

export interface IInspectorHost {
  // Each "on" function returns a method that when called, will unregister the handler.
  on(event: 'inspect', handler: (activities: IActivity[]) => void): () => void;
  //on(event: 'bot-updated', handler: (bot: /*IBotConfig*/ any) => void): () => void;
  on(event: 'accessory-click', handler: (id: string) => void): () => void;
  //enableAccessory(id: string, enabled: boolean): void;
}
