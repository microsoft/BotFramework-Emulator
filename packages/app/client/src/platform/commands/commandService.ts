import { Disposable } from "botframework-emulator-shared/built/base/lifecycle/disposable";
import { ICommandService } from "botframework-emulator-shared/built/platform/commands";
import { CommandRegistry } from "botframework-emulator-shared/built/platform/commands/commandRegistry";
import { Channel } from "botframework-emulator-shared/built/platform/ipc/channel";
import { IPC } from "../../ipc";

export const CommandService = new class extends Disposable implements ICommandService {

  private _channel: Channel;

  constructor() {
    super();
    this._channel = new Channel('commandService', IPC);
    this.toDispose(IPC.registerChannel(this._channel));

    this._channel.setListener('executeCommand', (...args: any[]) => {
      const id = args.shift();
      return this.executeCommand(undefined, id, ...args);
    });
  }

  executeCommand<T = any>(context: any, id: string, ...args: any[]): Promise<T> {
    const command = CommandRegistry.getCommand(id);
    if (!command) {
      return Promise.reject(new Error(`Command '${id}' not found`));
    } else {
      try {
        const result = command.handler<T>(context, ...args);
        return Promise.resolve(result);
      } catch (err) {
        return Promise.reject(err);
      }
    }
  }

  executeRemoteCommand(id: string, ...args: any[]): void {
    this._channel.send('executeCommand', id, ...args);
  }
}
