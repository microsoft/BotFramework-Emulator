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
import { IEndpointService } from 'botframework-config/lib/schema';
import { Activity } from 'botframework-schema';
import { ValueTypes } from '@bfemulator/app-shared';

export function areActivitiesEqual(a: Activity, b: Activity): boolean {
  if (!a || !b) {
    return false;
  }
  return a.id === b.id;
}

export function getActivityTargets(activities: Activity[]): Activity[] {
  return activities.reduce((targets: Activity[], activity: Activity) => {
    // In the case of trace activities with valueType === ValueTypes.Activity,
    // the log panel gives us the entire trace while
    // WebChat gives us the nested message activity.
    // Determine if we should be targeting the nested
    // activity within the selected activity.
    if (activity && activity.valueType === ValueTypes.Activity) {
      targets.push(activity.value as Activity);
    } else {
      targets.push(activity);
    }
    return targets;
  }, []);
}

export function isSpeechEnabled(endpoint: IEndpointService): boolean {
  return !!(endpoint && endpoint.appId && endpoint.appPassword);
}
