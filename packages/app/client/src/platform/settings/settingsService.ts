import { Disposable } from "botframework-emulator-shared/built/base/lifecycle/disposable";
import { CommandRegistry } from "botframework-emulator-shared/built/platform/commands/commandRegistry";

export interface IEmulatorSettings {
  url?: string;
}

export const SettingsService = new class extends Disposable {

  private _emulator: IEmulatorSettings = {};

  get emulator() { return this._emulator; }

  init() { }

  constructor() {
    super();
    this.toDispose(CommandRegistry.registerCommand("emulator:listener:url:set", (context: any, ...args: any[]): any => {
      SettingsService.emulator.url = args[0].replace('[::]', '127.0.0.1');
    }));
  }

}
