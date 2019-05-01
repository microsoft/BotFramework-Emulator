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
export enum ValueTypes {
  BotState = 'https://www.botframework.com/schemas/botState',
  Command = 'https://www.botframework.com/schemas/command',
  Debug = 'https://www.botframework.com/schemas/debug',
  Diff = 'https://www.botframework.com/schemas/diff',
  Error = 'https://www.botframework.com/schemas/error',
  Activity = 'https://www.botframework.com/schemas/activity',
}

export class ValueTypesMask {
  public static [ValueTypes.BotState] = 0b1;
  public static [ValueTypes.Command] = 0b10;
  public static [ValueTypes.Debug] = 0b100;
  public static [ValueTypes.Diff] = 0b1000;
  public static [ValueTypes.Error] = 0b10000;
  public static [ValueTypes.Activity] = 0b100000;
  public static BotState = 0b1;
  public static Command = 0b10;
  public static Debug = 0b100;
  public static Diff = 0b1000;
  public static Error = 0b10000;
  public static Activity = 0b100000;
  private constructor() {}
}
