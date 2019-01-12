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

import * as HttpStatus from "http-status-codes";
import * as Restify from "restify";

import BotEmulator from "../../botEmulator";
import GenericActivity from "../../types/activity/generic";
import ResourceResponse from "../../types/response/resource";
import OAuthLinkEncoder from "../../utils/oauthLinkEncoder";
import sendErrorResponse from "../../utils/sendErrorResponse";
import ConversationAPIPathParameters from "../conversationAPIPathParameters";

export default function replyToActivity(botEmulator: BotEmulator) {
  return (
    req: Restify.Request,
    res: Restify.Response,
    next: Restify.Next
  ): any => {
    const activity = req.body as GenericActivity;
    const conversationParameters: ConversationAPIPathParameters = req.params;

    try {
      // TODO: Need to re-enable
      // VersionManager.checkVersion(req.header("User-agent"));

      activity.id = null;
      activity.replyToId = req.params.activityId;

      // if we found the activity to reply to
      // if (!conversation.activities.find((existingActivity, index, obj) => existingActivity.id == activity.replyToId))
      // throw createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "replyToId is not a known activity id");

      const continuation = function(): void {
        const response: ResourceResponse = (req as any).conversation.postActivityToUser(
          activity
        );

        res.send(HttpStatus.OK, response);
        res.end();
      };

      const visitor = new OAuthLinkEncoder(
        botEmulator,
        req.headers.authorization as string,
        activity,
        conversationParameters.conversationId
      );
      visitor.resolveOAuthCards(activity).then(
        (value?: any) => {
          continuation();
        },
        (_reason: any) => {
          continuation();
        }
      );
    } catch (err) {
      sendErrorResponse(req, res, next, err);
    }

    next();
  };
}
