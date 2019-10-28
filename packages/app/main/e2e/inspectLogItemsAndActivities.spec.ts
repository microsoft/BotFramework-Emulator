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

import { Application } from 'spectron';

import { appPath, chromeDriverLogPath, electronPath, closeDialogsIfShowing } from './utils';

describe('Inspecting log items and activities', () => {
  let app: Application;

  beforeEach(async () => {
    jest.setTimeout(30000);
    app = new Application({
      path: electronPath,
      args: [appPath],
      chromeDriverLogPath,
    });
    await app.start();
    await closeDialogsIfShowing(app);
  });

  afterEach(async () => {
    if (app && app.isRunning()) {
      await app.stop();
    }
  });

  it('should be able to click log items and see them in the inspector panel', async () => {
    // open the open bot modal
    await app.client.click('button#open-bot-welcome');

    // enter the bot URL into the input and click connect
    await app.client.setValue('input[id*="auto-complete-textbox"]', 'http://localhost:3999/api/messages');
    await app.client.click('button#connect-open-bot');

    // wait for Web Chat to show up
    await app.client.waitForExist('div.bubble:first-of-type', 1500);

    // click an inspectable message in the log panel
    await app.client.click('[class*="inspectable-item"] > button');

    // wait for inspector to load
    await app.client.pause(3000);

    // switch focus to inspector webview
    await app.client.windowByIndex(1);

    // check inspector DOM
    let treeNodes = await app.client.$$('li[role="treeitem"]');

    expect(treeNodes.length).toBeGreaterThan(0);

    // switch focus back to app
    await app.client.windowByIndex(0);

    // click one of the network request items
    const networkReqItems = await app.client.$$('span[class*="network-req-item"]');
    await app.client.elementIdClick(networkReqItems[0].ELEMENT);

    // wait for inspector to load
    await app.client.pause(3000);

    // switch focus to inspector webview
    await app.client.windowByIndex(1);

    // check inspector DOM
    treeNodes = await app.client.$$('li[role="treeitem"]');

    expect(treeNodes.length).toBeGreaterThan(0);

    // switch focus back to app
    await app.client.windowByIndex(0);

    // click one of the network response items
    const networkResItems = await app.client.$$('span[class*="network-res-item"]');
    await app.client.elementIdClick(networkResItems[0].ELEMENT);

    // wait for inspector to load
    await app.client.pause(3000);

    // switch focus to inspector webview
    await app.client.windowByIndex(1);

    // check inspector DOM
    treeNodes = await app.client.$$('li[role="treeitem"]');

    expect(treeNodes.length).toBeGreaterThan(0);
  });

  it('should be able to click an activity in Web Chat and see it in the inspector panel', async () => {
    // open the open bot modal
    await app.client.click('button#open-bot-welcome');

    // enter the bot URL into the input and click connect
    await app.client.setValue('input[id*="auto-complete-textbox"]', 'http://localhost:3999/api/messages');
    await app.client.click('button#connect-open-bot');

    // wait for Web Chat to show up
    await app.client.waitForExist('div.bubble:first-of-type', 1500);

    // click an activity in Web Chat
    await app.client.click('div.bubble:first-of-type');

    // wait for inspector to load
    await app.client.pause(3000);

    // switch focus to inspector webview
    await app.client.windowByIndex(1);

    // check inspector DOM
    const treeNodes = await app.client.$$('li[role="treeitem"]');

    expect(treeNodes.length).toBeGreaterThan(0);
  });
});
