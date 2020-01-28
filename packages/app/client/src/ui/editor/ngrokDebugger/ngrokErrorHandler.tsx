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

import React from 'react';
import { LinkButton } from '@bfemulator/ui-react';
import { TunnelError } from 'packages/app/main/src/state';

export interface NgrokErrorHandlerProps {
  errors: TunnelError;
  onExternalLinkClick: (linkRef: string) => void;
  onReconnectToNgrokClick: () => void;
}

export const NgrokErrorHandler = (props: NgrokErrorHandlerProps) => {
  switch (props.errors.statusCode) {
    case 429:
      return (
        <>
          <legend>
            Looks like you have hit your free tier limit on connections to your tunnel. Below you will find several
            possible solutions.
          </legend>
          <ol>
            <li>
              <span>
                Signup for an Ngrok Account&nbsp;
                <LinkButton
                  ariaLabel="Signup for Ngrok account"
                  linkRole={true}
                  onClick={() => props.onExternalLinkClick('https://dashboard.ngrok.com/signup')}
                >
                  https://dashboard.ngrok.com/signup
                </LinkButton>
                and register your auth token as per the steps in
                <LinkButton
                  ariaLabel="Github link for tunnelling issues."
                  linkRole={true}
                  onClick={() =>
                    props.onExternalLinkClick('https://github.com/microsoft/botframework-solutions/issues/2406')
                  }
                >
                  https://github.com/microsoft/botframework-solutions/issues/2406
                </LinkButton>
              </span>
            </li>
            <li>Upgrade to a paid account of ngrok</li>
            <li>Wait for a few minutes without any activity</li>
          </ol>
        </>
      );

    case 402:
      return (
        <legend>
          Looks like the ngrok tunnel has expired. Try reconnecting to Ngrok or examine the logs for a detailed
          explanation of the error.
          <LinkButton
            ariaLabel="Click here to reconnect to ngrok."
            linkRole={false}
            onClick={props.onReconnectToNgrokClick}
          >
            Click here to reconnect to ngrok
          </LinkButton>
        </legend>
      );

    default:
      return (
        <legend>
          Looks like the ngrok tunnel does not exist anymore. Try reconnecting to Ngrok or examine the logs for a
          detailed explanation of the error.
          <LinkButton
            ariaLabel="Click here to reconnect to ngrok."
            linkRole={false}
            onClick={props.onReconnectToNgrokClick}
          >
            Click here to reconnect to ngrok
          </LinkButton>
        </legend>
      );
  }
};
