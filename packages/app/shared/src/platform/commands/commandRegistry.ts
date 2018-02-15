import { ICommandRegistry, ICommand, ICommandHandler, ICommandMap } from "./";
import { IDisposable } from "../../base/lifecycle/disposable"


export const CommandRegistry: ICommandRegistry = new class implements ICommandRegistry {

  private _commands: ICommandMap = {};

  registerCommand(idOrCommand: string | ICommand, handler?: ICommandHandler): IDisposable {

    if (!idOrCommand) {
      throw new Error("invalid command");
    }

    if (typeof idOrCommand === 'string') {
      if (!handler) {
        throw new Error("invalid command");
      }
      return this.registerCommand({ id: idOrCommand, handler });
    }

    const { id } = idOrCommand;

    this._commands[id] = idOrCommand;

    return {
      dispose() {
        this._commands[id] = undefined;
      }
    }
  }

  getCommand(id: string): ICommand {
    return this._commands[id];
  }

  getCommands(): ICommandMap {
    return this._commands;
  }
}
