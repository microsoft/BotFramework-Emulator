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
import { InspectorHost } from '@bfemulator/sdk-client';
import { Activity } from 'botframework-schema';
import { ExtensionChannel } from '@bfemulator/sdk-shared/build/types/ipc';
import { InspectableObjectLogItem, LogEntry, LogItem, LogItemType } from '@bfemulator/sdk-shared/build/types/log';
import { ValueTypes } from '@bfemulator/app-shared/built/enums/valueTypes';
import { diff } from 'deep-diff';

export function IpcHandler(type: ExtensionChannel): MethodDecorator {
  return function(elementDescriptor: any) {
    const { key, descriptor } = elementDescriptor;
    const initializer = function() {
      const host = (window as any).host as InspectorHost;
      const bound = this[key].bind(this);
      host.on(type as any, bound);
      return bound;
    };

    elementDescriptor.extras = [
      {
        kind: 'field',
        key,
        placement: 'own',
        initializer,
        descriptor: { ...descriptor, value: undefined },
      },
    ];
    return elementDescriptor;
  };
}

export function IpcHost(mixins: (keyof InspectorHost)[]) {
  return function(elementDescriptor: any) {
    const { elements } = elementDescriptor;
    const host = (window as any).host as InspectorHost;
    mixins.forEach(mixin => {
      const value = typeof host[mixin] === 'function' ? (host[mixin] as Function).bind(host) : host[mixin];

      const element = elements.find(element => element.key === mixin);
      const descriptor = {
        key: mixin,
        kind: 'method',
        placement: 'own',
        descriptor: {
          get: () => value,
        },
      };
      if (element) {
        Object.assign(element, descriptor);
      } else {
        elements.push(descriptor);
      }
    });

    return { ...elementDescriptor, elements };
  };
}

export async function updateTheme(themeInfo: { themeName: string; themeComponents: string[] }): Promise<void> {
  document.getElementById('root').className = themeInfo.themeName;

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

export function getBotState(
  entries: LogEntry<InspectableObjectLogItem>[],
  referenceBotState: Activity,
  offset: number = -1
): Activity {
  if (!referenceBotState) {
    return null;
  }
  const allBotStates = extractBotStateActivitiesFromLogEntries(entries);
  const index = allBotStates.findIndex(botState => botState.id === referenceBotState.id) + offset;
  return allBotStates[index];
}

export function extractBotStateActivitiesFromLogEntries(entries: LogEntry<InspectableObjectLogItem>[]): Activity[] {
  if (!entries) {
    return [];
  }
  return entries
    .reduce((agg, entry) => agg.concat(entry.items), [])
    .filter((item: LogItem<InspectableObjectLogItem>) => {
      const activity = item.payload.obj as Activity;
      return item.type === LogItemType.InspectableObject && activity.valueType === ValueTypes.BotState;
    })
    .map((item: LogItem) => (item.payload as InspectableObjectLogItem).obj as Activity);
}

export function buildDiff(a: Activity, b: Activity): Activity {
  const lhs = [];
  const rhs = [];
  const deltas = diff(b.value, a.value);
  (deltas || []).forEach(diff => {
    switch (diff.kind) {
      case 'A':
        {
          const { item, path } = diff;
          path.push(diff.index);
          if (item.kind === 'D') {
            lhs.push(path);
          } else if (item.kind === 'E') {
            rhs.push(path);
            lhs.push(path);
          } else {
            rhs.push(path);
          }
        }
        break;

      case 'D':
        lhs.push(diff.path);
        break;

      case 'E':
        rhs.push(diff.path);
        lhs.push(diff.path);
        break;

      case 'N':
        rhs.push(diff.path);
        break;
    }
  });

  // Clone the bot state and update the keys to show changes
  const botStateClone: Activity = JSON.parse(
    JSON.stringify(a, (key: string, value: any) => {
      if (value instanceof Array) {
        return Object.keys(value).reduce((conversion: any, key) => {
          conversion['' + key] = value[key];
          return conversion;
        }, {});
      }
      return value;
    })
  );
  botStateClone.valueType = ValueTypes.Diff;
  // values that were added
  rhs.forEach(path => {
    buildDiffNode('+', path, botStateClone.value, botStateClone.value);
  });
  // values that were removed
  lhs.forEach(path => {
    buildDiffNode('-', path, botStateClone.value, b.value);
  });
  return botStateClone;
}

export function buildDiffNode(prependWith: string, path: (string | number)[], target: any, source: any): void {
  let key;
  for (let i = 0; i < path.length; i++) {
    key = path[i];
    if (key in target && target[key] !== null && typeof target[key] === 'object') {
      target = target[key];
      source = source[key];
    } else {
      break;
    }
  }
  const value = source[key];
  delete target[key];
  target[prependWith + key] = value;
}
