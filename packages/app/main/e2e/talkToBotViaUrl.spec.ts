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
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS

import { Application } from 'spectron';

import { appPath, chromeDriverLogPath, electronPath, closeDialogsIfShowing } from './utils';

describe('Talking to a bot via URL', () => {
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

  it('should open a conversation with a bot via URL', async () => {
    // open the open bot modal
    await app.client.click('button#open-bot-welcome');

    // enter the bot URL into the input and click connect
    await app.client.setValue('input[id*="auto-complete-textbox"]', 'http://localhost:3999/api/messages');
    await app.client.click('button#connect-open-bot');

    // wait for Web Chat to show up
    await app.client.waitForExist('div.bubble:first-of-type');

    // grab the welcome message from the bot
    const welcomeMsgBubble = await app.client.$('div.bubble:first-of-type > div > span');
    const welcomeMsgText = await app.client.elementIdText(welcomeMsgBubble.value.ELEMENT);
    expect(welcomeMsgText.value).toBe('Welcome to the e2e testing bot! :)');
  });

  it('should honor a custom user ID and restart the conversation with the appropriate id', async () => {
    // open the settings page
    await app.client.click('nav > button[title="Settings"]');

    // check the custom user id checkbox if it's unchecked
    const checked = await app.client.getAttribute('input#use-custom-id', 'checked');
    if (!checked) {
      await app.client.click('input#use-custom-id');
    }

    // fill the custom user id input with a custom id
    const customUserId = 'clippy';
    await app.client.setValue('input[name="userGUID"]', customUserId);

    // save settings
    await app.client.click('button[class*="save-button"]');

    // navigate to welcome page (click first tab)
    await app.client.click('div.tab-container:first-of-type');

    // open the open bot modal
    await app.client.click('button#open-bot-welcome');

    // enter the bot URL into the input and click connect
    await app.client.setValue('input[id*="auto-complete-textbox"]', 'http://localhost:3999/api/messages');
    await app.client.click('button#connect-open-bot');

    // wait for Web Chat to show up
    await app.client.waitForExist('div.bubble:first-of-type', 3000);

    // tell the bot to send an activity back containing the user id
    await app.client.setValue('input[data-id="webchat-sendbox-input"]', 'get user id');
    await app.client.click('button[title="Send"]');

    // wait for the response from the bot
    await app.client.pause(1000);

    // grab the user id from the bot's response
    let msgBubbles = await app.client.$$('div.bubble > div > span');
    let msgBubble = await app.client.elementIdText(msgBubbles[2].ELEMENT);
    const initialUserId = msgBubble.value;

    // verify that the user ID is the custom ID set via the settings page
    expect(initialUserId).toBe(customUserId);

    // restart the conversation with the same user id
    await app.client.click('button#restart-conversation ~ button'); // open the split button dropdown
    await app.client.click('ul > li[id*="split_button"]:nth-child(2)'); // click the second option (restart with same user id)

    // wait for Web Chat to show up
    await app.client.waitForExist('div.bubble:first-of-type', 3000);

    // tell the bot to send an activity back containing the user id
    await app.client.setValue('input[data-id="webchat-sendbox-input"]', 'get user id');
    await app.client.click('button[title="Send"]');

    // wait for the response from the bot
    await app.client.pause(1000);

    // grab the user id from the bot's response
    msgBubbles = await app.client.$$('div.bubble > div > span');
    msgBubble = await app.client.elementIdText(msgBubbles[2].ELEMENT);
    const userIdAfterRestartingWithSame = msgBubble.value;

    expect(userIdAfterRestartingWithSame).toBe(initialUserId);

    // restart the conversation with a new user id
    await app.client.click('button#restart-conversation');

    // wait for Web Chat to show up
    await app.client.waitForExist('div.bubble:first-of-type', 3000);

    // tell the bot to send an activity back containing the user id
    await app.client.setValue('input[data-id="webchat-sendbox-input"]', 'get user id');
    await app.client.click('button[title="Send"]');

    // wait for the response from the bot
    await app.client.pause(1000);

    // grab the user id from the bot's response
    msgBubbles = await app.client.$$('div.bubble > div > span');
    msgBubble = await app.client.elementIdText(msgBubbles[2].ELEMENT);
    const newUserId = msgBubble.value;

    expect(newUserId).not.toBe(initialUserId);
  });
});
