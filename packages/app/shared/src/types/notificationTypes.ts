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

import { uniqueId } from '@bfemulator/sdk-shared';

export enum NotificationType {
  Info,
  Error,
  Warning,
}

export interface NotificationCTAButton {
  text: string;
  onClick?: (...args: any[]) => any;
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: number;
  read: boolean;
  buttons?: NotificationCTAButton[];
  addButton: (text: string, onClick?: (...args: any[]) => any) => void;
}

export class NotificationImpl implements Notification {
  public readonly id: string;
  public readonly timestamp: number;
  public type: NotificationType;
  public message: string;
  public read: boolean;
  public buttons?: NotificationCTAButton[];

  constructor() {
    this.id = uniqueId();
    this.timestamp = Date.now();
    this.read = false;
    this.buttons = [];
  }

  /** Adds a CTA button to the notification */
  public addButton(text: string, onClick?: (...args: any[]) => any): void {
    const button: NotificationCTAButton = { text, onClick };
    this.buttons.push(button);
  }
}
