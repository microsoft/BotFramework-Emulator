import { Disposable } from "botframework-emulator-shared/built/base/lifecycle/disposable";
import { CommandRegistry } from "botframework-emulator-shared/built/platform/commands/commandRegistry";

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
    this.toDispose(CommandRegistry.registerCommand("settings:emulator:url:set", (context: any, ...args: any[]): any => {
      SettingsService.emulator.url = args[0].replace('[::]', '127.0.0.1');
    }));
  }
}
