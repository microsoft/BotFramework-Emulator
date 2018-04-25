import { IActivity, IBotConfig } from '@bfemulator/sdk-shared';

export interface IInspectorHost {
  // The current bot (msbot schema)
  readonly bot: IBotConfig;
  readonly logger: {
    log(message: string): () => void;
    error(message: string): () => void;
  };
  // Each "on" function returns a method that when called, will unregister the handler.
  on(event: 'inspect', handler: (activity: IActivity) => void): () => void;
  on(event: 'bot-updated', handler: (bot: IBotConfig) => void): () => void;
  on(event: 'accessory-click', handler: (id: string) => void): () => void;
  // Enable/disable an accessory button
  enableAccessory(id: string, enabled: boolean): void;
  // Set the state of an accessory button
  setAccessoryState(id: string, state: string): void;
  // Set inspector title
  setInspectorTitle(title: string): void;
}
