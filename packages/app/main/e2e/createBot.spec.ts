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

import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

import { Application } from 'spectron';

import { appPath, chromeDriverLogPath, electronPath, closeDialogsIfShowing } from './utils';
import { init, setupMock } from './mocks/electronDialog';

describe('Creating a bot', () => {
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

  // TODO: could be made more comprehensive by checking that the bot was added to MRU
  // on welcome page
  it('should create a bot', async () => {
    // open the create bot modal
    const ctaLinks = await app.client.$$('button[class*="link-button"]');
    const createBotLink = ctaLinks[1];
    await app.client.elementIdClick(createBotLink.ELEMENT);

    // fill out the bot name and endpoint
    await app.client.setValue('input[name="create-bot-name"]', 'e2e-test-bot');
    await app.client.setValue('input[name="create-bot-url"]', 'http://localhost:3978/api/messages');

    // mock the result from the save dialog
    const tempPath = await app.electron.remote.app.getPath('temp');
    const testBotPath = join(tempPath, 'e2e-test-bot.bot');
    await setupMock(app, { method: 'showSaveDialog', value: testBotPath });

    // click save
    await app.client.click('button[name="create-bot-save"]');

    // wait for Web Chat to show up
    await app.client.waitForExist('div[role="log"] + div[role="form"]', 3000);

    // verify that the bot was written to disk
    expect(existsSync(testBotPath)).toBe(true);

    // delete the bot from disk
    unlinkSync(testBotPath);
  });
});
