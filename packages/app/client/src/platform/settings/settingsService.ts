import { Disposable } from '@bfemulator/sdk-shared';
import { CommandRegistry } from '../../commands';

export function registerCommands() {
  CommandRegistry.registerCommand("settings:emulator:url:set", (url: string): any => {
    SettingsService.emulator.url = url.replace('[::]', '127.0.0.1');
  });
}

export interface IEmulatorSettings {
  url?: string;
}

class EmulatorSettings implements IEmulatorSettings {
  private _url: string;

  get url(): string {
    if (!this._url || !this._url.length) {
      throw new Error("Emulator url not set");
    }
    return this._url;
  }
  set url(value: string) {
    this._url = value;
  }
}

export const SettingsService = new class extends Disposable {

  private _emulator: EmulatorSettings;

  get emulator(): IEmulatorSettings { return this._emulator; }

  init() { }

  constructor() {
    super();
    this._emulator = new EmulatorSettings();
  }
}
