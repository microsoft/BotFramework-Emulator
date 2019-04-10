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
import { ValueTypes } from '@bfemulator/app-shared/built/enums';

import { BotStateVisualizer } from './BotStateVisualizer';
import { IpcHandler } from './utils';
import { BotState } from './types';
import { ViewState } from './ViewState';

export class WindowHostReceiver {
  private visualizer: BotStateVisualizer;

  constructor(visualizer: BotStateVisualizer) {
    this.visualizer = visualizer;
  }

  @IpcHandler('inspect')
  protected inspectHandler(data: { value: BotState; valueType: string }): void {
    const { visualizer } = this;
    visualizer.isDiff = data.valueType === ValueTypes.Diff;
    visualizer.dataProvider = data.value;
    // Initialize the default and sync accessory state
    if (!visualizer.viewState) {
      this.accessoryClick(ViewState.Graph);
    }
  }

  @IpcHandler('theme')
  protected async themeHandler(themeInfo): Promise<void> {
    const oldThemeComponents = document.querySelectorAll('[data-theme-component="true"]');
    const head = document.querySelector('head');
    const fragment = document.createDocumentFragment();
    const promises = [];
    // Create the new links for each theme component
    themeInfo.themeComponents.forEach(themeComponent => {
      const link = document.createElement('link');
      promises.push(
        new Promise(resolve => {
          link.addEventListener('load', resolve);
        })
      );
      link.href = themeComponent;
      link.rel = 'stylesheet';
      link.setAttribute('data-theme-component', 'true');
      fragment.appendChild(link);
    });
    head.insertBefore(fragment, head.firstElementChild);
    // Wait for all the links to load their css
    await Promise.all(promises);
    // Remove the old links
    oldThemeComponents.forEach(themeComponent => {
      if (themeComponent.parentElement) {
        themeComponent.parentElement.removeChild(themeComponent);
      }
    });
  }

  @IpcHandler('accessory-click')
  protected accessoryClick(id: ViewState): void {
    const { host } = window as any;
    const resetId = id === ViewState.Graph ? ViewState.Json : ViewState.Graph;
    host.setAccessoryState(resetId, 'default');
    host.setAccessoryState(id, 'selected');
    this.visualizer.viewState = id;
  }
}
