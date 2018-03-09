import { FSWatcher } from 'fs';
import * as Path from 'path';
import * as Chokidar from 'chokidar';
import { mainWindow } from './main';

interface IFileWatcher {
  watch: (botProjectDir: string) => void;
  dispose: () => void;
  onFileAdd: (file: string, fstats?: any) => void;
  onFileRemove: (file: string, fstats?: any) => void;
}

/** Singleton class that will watch one bot project directory at a time */
export const BotProjectFileWatcher = new class FileWatcher implements IFileWatcher {
  private _botProjectDir: string;
  private _fileWatcherInstance: FSWatcher;

  constructor() {}

  watch(botProjectDir: string): void {
    // stop watching any other project directory
    this.dispose();

    // TODO: Implement way of watching deeper into project directory tree
    this._botProjectDir = botProjectDir;
    this._fileWatcherInstance = Chokidar.watch(this._botProjectDir, { depth: 1 });

    this._fileWatcherInstance
      .on('add', this.onFileAdd.bind(this))
      .on('unlink', this.onFileRemove.bind(this));
  }

  dispose(): void {
    if (this._fileWatcherInstance) {
      this._fileWatcherInstance.close();
      this._botProjectDir = null;
    }
  }

  // TODO: Enable watching more extensions
  onFileAdd(file: string, fstats?: any): void {
    if (Path.extname(file) === '.transcript') {
      mainWindow.commandService.remoteCall('transcript:add', file);
    }
  }

  // TODO: Enable watching more extensions
  onFileRemove(file: string, fstats?: any): void {
    if (Path.extname(file) === '.transcript') {
      mainWindow.commandService.remoteCall('transcript:remove', file);
    }
  }
}
