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

jest.mock('fs', () => ({
  existsSync: () => false,
  readFileSync: () => ''
}));

jest.mock('botframework-config', () => ({
  load: () => ({})
}));

jest.mock('./main', () => ({
  CommandService: {
    remoteCall: () => null
  }
}));

jest.mock('./utils/ensureStoragePath', () => ({
  ensureStoragePath: () => ''
}));

import { Migrator } from './migrator';

describe('Migrator tests', () => {
  let tempLeaveMigrationMarker;
  let tempMigrateBots;


  beforeEach(() => {
    tempLeaveMigrationMarker = (Migrator as any).leaveMigrationMarker;
    tempMigrateBots = Migrator.migrateBots;
  });

  afterEach(() => {
    (Migrator as any).leaveMigrationMarker = tempLeaveMigrationMarker;
    Migrator.migrateBots = tempMigrateBots;
  })

  test('startup', async () => {
    const mockLeaveMigrationMarker = jest.fn(() => null);
    (Migrator as any).leaveMigrationMarker = mockLeaveMigrationMarker;
    // migration won't happen the first time, but will the second time
    const mockMigrateBots = jest.fn()
                              .mockResolvedValueOnce(false)
                              .mockResolvedValueOnce(true);
    Migrator.migrateBots = mockMigrateBots;

    // marker should only be placed when migration succeeds
    await Migrator.startup();
    expect(mockLeaveMigrationMarker).not.toHaveBeenCalled();

    await Migrator.startup();
    expect(mockLeaveMigrationMarker).toHaveBeenCalled();
  });
});
