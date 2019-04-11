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
import { Activity } from 'botframework-schema';

interface CustomActivityProperties {
  from: {
    role?: string;
  };

  recipient?: {
    id?: string;
    role?: string;
  };
}

export type CustomActivity = Activity & CustomActivityProperties;

export function cleanupId(
  activities: CustomActivity[],
  botId: string = findIdWithRole(activities, 'bot'),
  userId: string = findIdWithRole(activities, 'user')
) {
  const roleIdMap = { bot: botId, user: userId };

  activities = activities.map((activity: any) => {
    const { type } = activity;

    if (type === 'event' || type === 'message' || type === 'messageReaction' || type === 'typing') {
      activity = {
        ...activity,
        from: {
          ...activity.from,
          id: roleIdMap[activity.from.role] || activity.from.id,
        },
        recipient: {
          ...activity.recipient,
          id: roleIdMap[activity.recipient.role] || activity.recipient.id,
        },
      };
    }

    return activity;
  });

  return activities;
}

export function findIdWithRole(activities: CustomActivity[], role: string): string {
  return activities.reduce((id: string, { recipient }) => {
    if (id) {
      return id;
    } else if (recipient && recipient.role === role) {
      return recipient.id;
    } else {
      return null;
    }
  }, null);
}

export const __TESTABLES = { findIdWithRole };
