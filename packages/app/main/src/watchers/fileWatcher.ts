import * as chokidar from "chokidar";
import { FSWatcher, WatchOptions } from "chokidar";
import * as fs from "fs";

export abstract class FileWatcher implements FileWatcher {
  protected abstract onFileAdd: (file: string, fstats?: fs.Stats) => void;
  protected abstract onFileRemove: (file: string, fstats?: fs.Stats) => void;
  protected abstract onFileChange: (file: string, fstats?: fs.Stats) => void;

  protected abstract get options(): WatchOptions;

  protected watcher: FSWatcher;
  private paths: string | string[];

  public async watch(paths: string | string[]): Promise<true> {
    if (this.paths === paths && this.isWatching) {
      return true;
    }
    if (this.watcher) {
      this.watcher.close();
    }

    this.watcher = chokidar
      .watch(paths)
      .on("addDir", this.onFileAdd)
      .on("add", this.onFileAdd)
      .on("unlinkDir", this.onFileRemove)
      .on("unlink", this.onFileRemove)
      .on("change", this.onFileChange);

    return true;
  }

  public unwatch(): void {
    if (!this.watcher) {
      return;
    }
    this.watcher.close();
    this.watcher = null;
  }

  public get isWatching(): boolean {
    return !!this.watcher;
  }
}
