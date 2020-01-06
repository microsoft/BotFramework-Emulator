import React from 'react';
import { LinkButton } from '@bfemulator/ui-react';
import { TunnelError } from 'packages/app/main/src/state';

export interface ngrokErrorHandlerProps {
  errors: TunnelError;
  onExternalLinkClick: (linkRef: string) => void;
  onReconnectToNgrokClick: () => void;
}

export default (props: ngrokErrorHandlerProps) => {
  switch (props.errors.statusCode) {
    case 429:
      return (
        <>
          <legend>
            Looks like you have hit your free tier limit on connections to your tunnel. These are few solutions.
          </legend>
          <ol>
            <li>
              <span>
                Try signing up here
                <LinkButton
                  ariaLabel="Signup for Ngrok account.&nbsp;"
                  linkRole={true}
                  onClick={() => props.onExternalLinkClick('https://dashboard.ngrok.com/signup')}
                >
                  https://dashboard.ngrok.com/signup
                </LinkButton>
                and register your auth token as per the steps in
                <LinkButton
                  ariaLabel="Github link for tunnelling issues.&nbsp;"
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
          Looks like the ngrok tunnel has expired. Try reconnecting to Ngrok or examine the logs for detailed
          explanation of the error.
          <LinkButton
            ariaLabel="Click here to reconnect to ngrok.&nbsp;"
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
          Looks like the ngrok tunnel does not exist anymore. Try reconnecting to Ngrok or examine the logs for detailed
          explanation of the error.
          <LinkButton
            ariaLabel="Click here to reconnect to ngrok.&nbsp;"
            linkRole={false}
            onClick={props.onReconnectToNgrokClick}
          >
            Click here to reconnect to ngrok
          </LinkButton>
        </legend>
      );
  }
};
