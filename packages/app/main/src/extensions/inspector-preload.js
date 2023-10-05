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

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ipcRenderer } = require('electron');

ipcRenderer.on('inspect', (sender, obj) => {
  window.host.dispatch('inspect', obj);
});

ipcRenderer.on('bot-updated', (sender, bot) => {
  window.host.bot = bot;
  window.host.dispatch('bot-updated', bot);
});

ipcRenderer.on('chat-log-updated', (sender, conversationId, logEntries) => {
  window.host.dispatch('chat-log-updated', conversationId, logEntries);
});

ipcRenderer.on('highlighted-objects-updated', (sender, highlightedObjects) => {
  window.host.dispatch('highlighted-objects-updated', highlightedObjects);
});

ipcRenderer.on('accessory-click', (sender, id, currentState) => {
  window.host.dispatch('accessory-click', id, currentState);
});

ipcRenderer.on('theme', (sender, ...args) => {
  window.host.dispatch('theme', ...args);
});

window.host = {
  bot: {},
  handlers: new Proxy(
    {},
    {
      get(target, p) {
        if (!(p in target)) {
          target[p] = [];
        }
        return target[p];
      },
    }
  ),
  logger: {
    error: function(message) {
      ipcRenderer.sendToHost('logger.error', message);
    },
    log: function(message) {
      ipcRenderer.sendToHost('logger.log', message);
    },
    logLuisEditorDeepLink: function(message) {
      ipcRenderer.sendToHost('logger.luis-editor-deep-link', message);
    },
    warn: function(message) {
      ipcRenderer.sendToHost('logger.warn', message);
    },
  },

  on: function(event, handler) {
    if (handler && Array.isArray(this.handlers[event]) && !this.handlers[event].includes(handler)) {
      this.handlers[event].push(handler);
    }
    return () => {
      this.handlers[event] = this.handlers[event].filter(item => item !== handler);
    };
  },

  createAriaAlert: function(msg) {
    ipcRenderer.sendToHost('create-aria-alert', msg);
  },

  enableAccessory: function(id, enabled) {
    if (typeof id === 'string') {
      ipcRenderer.sendToHost('enable-accessory', id, !!enabled);
    }
  },

  setAccessoryState: function(id, state) {
    if (typeof id === 'string' && typeof state === 'string') {
      ipcRenderer.sendToHost('set-accessory-state', id, state);
    }
  },

  setInspectorTitle: function(title) {
    if (typeof title === 'string') {
      ipcRenderer.sendToHost('set-inspector-title', title);
    }
  },

  trackEvent: function(name, properties) {
    ipcRenderer.sendToHost('track-event', name, properties);
  },

  setHighlightedObjects(documentId, objects) {
    ipcRenderer.sendToHost('set-highlighted-objects', documentId, objects);
  },

  setInspectorObjects(documentId, objects) {
    ipcRenderer.sendToHost('set-inspector-objects', documentId, objects);
  },

  dispatch: function(event, ...args) {
    this.handlers[event].forEach(handler => handler(...args));
  },
};
