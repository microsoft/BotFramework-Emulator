//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
import * as fs from 'fs';

import * as chokidar from 'chokidar';
import { FSWatcher, WatchOptions } from 'chokidar';

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
      .on('addDir', this.onFileAdd)
      .on('add', this.onFileAdd)
      .on('unlinkDir', this.onFileRemove)
      .on('unlink', this.onFileRemove)
      .on('change', this.onFileChange);

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
