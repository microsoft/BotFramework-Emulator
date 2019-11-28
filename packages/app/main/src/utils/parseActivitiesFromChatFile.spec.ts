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

import { parseActivitiesFromChatFile } from './parseActivitiesFromChatFile';

jest.mock('path', () => ({
  extname: jest.fn((filename: string) => {
    const parts = filename.split('.');
    return '.' + parts[parts.length - 1] || '';
  }),
}));

const mockReadContents = jest.fn(() => ['activity1', 'activity2', 'activity3']);
jest.mock('@microsoft/bf-chatdown', () => async () => mockReadContents());

jest.mock('./readFileSync', () => ({
  readFileSync: jest.fn(() => 'file contents'),
}));

describe('parseActivitiesFromChatFile', () => {
  it('should parse activities from a .chat file', async () => {
    const activities = await parseActivitiesFromChatFile('some-transcript.chat');
    expect(activities).toEqual(['activity1', 'activity2', 'activity3']);
  });

  it('should throw an error if the passed in file is not a .chat file', async () => {
    try {
      await parseActivitiesFromChatFile('some-transcript.doc');
      expect(true).toBe(false); // ensure catch is hit
    } catch (e) {
      expect(e).toEqual(new Error('Can only use chatdown on .chat files.'));
    }
  });

  it('should throw an error if something goes wrong while parsing the activities', async () => {
    mockReadContents.mockImplementationOnce(() => {
      throw new Error('Invalid token at JSON position 4.');
    });

    try {
      await parseActivitiesFromChatFile('some-transcript.chat');
      expect(true).toBe(false); // ensure catch is hit
    } catch (e) {
      expect(e).toEqual(
        new Error(
          `Error while converting .chat file to list of activities: ${new Error('Invalid token at JSON position 4.')}`
        )
      );
    }
  });
});
