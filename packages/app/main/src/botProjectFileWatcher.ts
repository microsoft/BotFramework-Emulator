
import { FileInfo } from '@bfemulator/app-shared';
import { callbackToPromise } from '@fuselab/ui-shared/lib/asyncUtils';
import { FSWatcher, Stats, exists, readFile } from 'fs';
import * as Path from 'path';
import * as Chokidar from 'chokidar';
import { mainWindow } from './main';

interface IFileWatcher {
  watch: (botProjectDir: string) => void;
  dispose: () => void;
  onFileAdd: (file: string, fstats?: any) => void;
  onFileRemove: (file: string, fstats?: any) => void;
}

async function findGitIgnore(directory: string): Promise<string> {
  const gitIgnore = '.gitignore';
  let curDir = directory;

  for (; ;) {
    const filePath = Path.resolve(curDir, '.gitignore');
    const found = await callbackToPromise<boolean>(exists, filePath);
    if (found) {
      return filePath;
    }
    const parent = Path.resolve(curDir, '..');
    if (parent === curDir || !parent) {
      break;
    }
    curDir = parent;
  }

  return null;
}

async function readGitIgnore(filePath: string): Promise<string[]> {
  if (!filePath) {
    return [];
  }

  const text = await callbackToPromise<string>(readFile, filePath, 'utf-8');

  return text.split(/[\n\r]/).map(x => x.trim()).filter(x => x && !x.startsWith('#'));
}

/** Singleton class that will watch one bot project directory at a time */
export const BotProjectFileWatcher = new class FileWatcher implements IFileWatcher {
  private _botProjectDir: string;
  private _fileWatcherInstance: FSWatcher;

  constructor() { }

  async watch(botProjectDir: string): Promise<boolean> {
    // stop watching any other project directory
    this.dispose();

    // TODO: Implement way of watching deeper into project directory tree
    this._botProjectDir = botProjectDir;

    const gitIgnoreFile = await findGitIgnore(botProjectDir);
    const ignoreGlobs = await readGitIgnore(gitIgnoreFile);

    this._fileWatcherInstance = Chokidar.watch(this._botProjectDir, {
      ignored: ignoreGlobs,
      followSymlinks: false
    });

    this._fileWatcherInstance
      .on('addDir', this.onFileAdd.bind(this))
      .on('unlinkDir', this.onFileRemove.bind(this))
      .on('add', this.onFileAdd.bind(this))
      .on('unlink', this.onFileRemove.bind(this));

    return true;
  }

  dispose(): void {
    if (this._fileWatcherInstance) {
      this._fileWatcherInstance.close();
      this._botProjectDir = null;
    }
  }

  // TODO: Enable watching more extensions
  onFileAdd(file: string, fstats?: Stats): void {
    // only show .transcript files
    if (Path.extname(file) === '.transcript') {
      const fileInfo: FileInfo = {
        path: file,
        type: fstats.isDirectory() ? 'container' : 'leaf',
        name: Path.basename(file)
      };
      mainWindow.commandService.remoteCall('file:add', fileInfo);
    }
  }

  // TODO: Enable watching more extensions
  onFileRemove(file: string, fstats?: Stats): void {
    mainWindow.commandService.remoteCall('file:remove', file);
  }
}
