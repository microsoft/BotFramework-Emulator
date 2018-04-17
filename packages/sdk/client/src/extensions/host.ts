import { IActivity } from '@bfemulator/sdk-shared';

export interface IInspectorHost {
  // Each "on" function returns a method that when called, will unregister the handler.
  on(event: 'inspect', handler: (activity: IActivity) => void): () => void;
  //on(event: 'bot-updated', handler: (bot: /*IBotConfig*/ any) => void): () => void;
  on(event: 'accessory-click', handler: (id: string) => void): () => void;
  // Enable/disable an accessory button
  enableAccessory(id: string, enabled: boolean): void;
  // Set the state of an accessory button
  setAccessoryState(id: string, state: string): void;
  // Set inspector title
  setInspectorTitle(title: string): void;
}
