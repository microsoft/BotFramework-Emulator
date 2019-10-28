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
import { init } from './mocks/electronDialog';

describe('Navigating a dialog with focus trap', () => {
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

  it('should open a dialog and focus should be trapped in the dialog', async () => {
    // wait for Welcome page to load
    await app.client.waitForExist('button*=Sign in with your Azure');

    // press escape to get out of "First time startup" dialogs.
    await app.client.keys(['\uE00C', '\uE00C']);

    await app.client.click('button*=Sign in with your Azure');
    expect(await app.client.hasFocus("button*=Don't have an Azure Account?")).toBeTruthy();

    // press tab to move focus within the dialog
    await app.client.keys(['\uE004', '\uE004', '\uE004']);
    expect(await app.client.hasFocus('button=Sign in with Azure')).toBeTruthy();

    // press tab again to circle through the focus trap in the dialog
    await app.client.keys(['\uE004', '\uE004']);
    expect(await app.client.hasFocus("button*=Don't have an Azure Account?")).toBeTruthy();

    // TODO: Improving this test would be to include a SHIFT+TAB focus check, but webdriver.io v4 doesn't have the ability to press two buttons simultaneously.
  });
});
