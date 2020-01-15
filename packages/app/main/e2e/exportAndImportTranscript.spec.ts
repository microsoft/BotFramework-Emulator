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

import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

import { Application } from 'spectron';

import { appPath, chromeDriverLogPath, electronPath, closeDialogsIfShowing } from './utils';
import { init, setupMock } from './mocks/electronDialog';

describe('Exporting and importing transcripts', () => {
  let app: Application;

  beforeEach(async () => {
    jest.setTimeout(30000);
    app = new Application({
      path: electronPath,
      args: [appPath],
      chromeDriverLogPath,
    });
    init(app);
    await app.start();
    await closeDialogsIfShowing(app);
  });

  afterEach(async () => {
    if (app && app.isRunning()) {
      await app.stop();
    }
  });

  it('should export a transcript to disk', async () => {
    // mock the electron save dialog to return the path for the transcript we want to export
    const transcriptPath = join(__dirname, 'e2e-exported-transcript.transcript');
    await setupMock(app, { method: 'showSaveDialog', value: transcriptPath });

    // open the open bot modal
    await app.client.click('button#open-bot-welcome');

    // enter the bot URL into the input and click connect
    await app.client.setValue('input[id*="auto-complete-textbox"]', 'http://localhost:3999/api/messages');
    await app.client.click('button#connect-open-bot');

    // wait for Web Chat to show up
    await app.client.waitForExist('div.bubble:first-of-type', 3000);

    // greet the bot
    await app.client.setValue('input[data-id="webchat-sendbox-input"]', 'Hello');
    await app.client.click('button[title="Send"]');

    // wait for the response from the bot
    await app.client.pause(1000);

    // respond to the bot
    await app.client.setValue('input[data-id="webchat-sendbox-input"]', "I'm doing well, thanks for asking!");
    await app.client.click('button[title="Send"]');

    // wait for the response from the bot
    await app.client.pause(1000);

    // save the transcript to disk
    await app.client.click('div[class*="toolbar"] > button[class*="save-icon"]');

    // wait for save
    await app.client.pause(500);

    // verify that the transcript was saved to disk
    expect(existsSync(transcriptPath)).toBe(true);

    // delete the transcript
    unlinkSync(transcriptPath);
  });

  it('should import a transcript from disk', async () => {
    // mock the electron open dialog to return the path for the transcript we want to import
    const testBotDir = join(__dirname, '..', '..', '..', 'tools', 'test-bot');
    await setupMock(app, { method: 'showOpenDialog', value: [testBotDir] });

    // open the open bot modal
    await app.client.click('button#open-bot-welcome');

    // enter the .bot file path into the input and click connect
    const botFilePath = join(__dirname, '..', '..', '..', 'tools', 'test-bot', 'e2e-test-bot.bot');
    await app.client.setValue('input[id*="auto-complete-textbox"]', botFilePath);
    await app.client.click('button#connect-open-bot');

    // wait for Web Chat to show up
    await app.client.waitForExist('div.bubble:first-of-type', 5000);

    // close the livechat tab
    await app.client.click('button[class*="editor-tab-close"][title*="Close Live Chat"]');

    // open the resources tab
    await app.client.click('nav > button[title="Resources"]');

    // expand the transcripts explorer
    await app.client.click('div[class*="resources-bar"] div[aria-label="transcripts"]');

    // click "Choose a different location"
    await app.client.click('div[class*="resources-bar"] div[aria-label="transcripts"] ~ div[class*="body"] button');

    // browse for a new transcripts directory
    await app.client.click('button[data-prop="transcriptsPath"]');

    // click save if it's enabled, otherwise the path was already set to the e2e test path, and we should dismiss the dialog
    const disabled = await app.client.getAttribute(
      'div[class*="dialog-host-content"] div[class*="footer"] > button:nth-of-type(2)',
      'disabled'
    );
    if (disabled === 'true') {
      await app.client.click('div[class*="dialog-host-content"] div[class*="footer"] > button:nth-of-type(1)');
    } else {
      await app.client.click('div[class*="dialog-host-content"] div[class*="footer"] > button:nth-of-type(2)');
    }

    // click the transcript to load it
    await app.client.click('li[title*="sample-conversation.transcript"]');

    // wait for Web Chat to show up
    await app.client.waitForExist('div.bubble:first-of-type', 5000);

    // there should be 5 chat bubbles visible
    const msgBubbles = await app.client.$$('div.bubble > div > span');
    expect(msgBubbles.length).toBe(5);

    const msgBubble0 = await app.client.elementIdText(msgBubbles[0].ELEMENT);
    expect(msgBubble0.value).toEqual('Welcome to the e2e testing bot! :)');

    const msgBubble1 = await app.client.elementIdText(msgBubbles[1].ELEMENT);
    expect(msgBubble1.value).toEqual('Hello');

    const msgBubble2 = await app.client.elementIdText(msgBubbles[2].ELEMENT);
    expect(msgBubble2.value).toEqual('Hello! :)');

    const msgBubble3 = await app.client.elementIdText(msgBubbles[3].ELEMENT);
    expect(msgBubble3.value).toEqual('How are you doing?');

    const msgBubble4 = await app.client.elementIdText(msgBubbles[4].ELEMENT);
    expect(msgBubble4.value).toEqual("I'm doing great, thanks for asking!");
  });
});
