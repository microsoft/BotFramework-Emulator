import {lazy} from '@intercom/ui-shared/lib';
import { Disposable } from '@bfemulator/sdk-shared';
import { CommandRegistry } from '../../commands';

export function registerCommands() {
  CommandRegistry.registerCommand("receive-global-settings", (settings: {
    url: string,
    cwd: string
  }): any => {
    SettingsService.emulator.url = settings.url.replace('[::]', '127.0.0.1');
    SettingsService.emulator.cwd = settings.cwd.replace(/\\/g, '/');
  });
}

export interface IEmulatorSettings {
  url?: string;
  cwd?: string;
  readonly cwdAsBase: string;
}

class EmulatorSettings implements IEmulatorSettings {
  private _url: string;
  private _cwd: string;

  get url(): string {
    if (!this._url || !this._url.length) {
      throw new Error("Emulator url not set");
    }
    return this._url;
  }
  set url(value: string) {
    this._url = value;
  }

  get cwd(): string {
    if (!this._cwd || !this._cwd.length) {
      throw new Error("Emulator cwd not set");
    }
    return this._cwd;
  }

  set cwd(value: string) {
    this._cwd = value;
  }

  @lazy()
  get cwdAsBase() : string {
    let base = this.cwd;
    if (!base.startsWith('/')) {
      base = `/${base}`;    
    }

    return base;
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
