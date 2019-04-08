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
import { BotState, HierarchicalData } from './types';

export function IpcHandler(type: string): MethodDecorator {
  return function(elementDescriptor: any) {
    const { key, descriptor } = elementDescriptor;
    const initializer = function() {
      const bound = this[key].bind(this);
      (window as any).host.on(type, bound);
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

export function hydrateWithChildren(data: any, parent: HierarchicalData) {
  Object.keys(data).forEach(key => {
    const child = { name: key } as HierarchicalData;
    if (data[key] !== null && typeof data[key] === 'object') {
      child.children = [];
      hydrateWithChildren(data[key], child);
    } else {
      child.value = data[key];
    }
    parent.children.push(child);
  });
}

export function buildHierarchicalData(botState: BotState): HierarchicalData {
  const dataProvider = { name: 'botState', children: [] };
  hydrateWithChildren(botState, dataProvider);

  return dataProvider;
}
