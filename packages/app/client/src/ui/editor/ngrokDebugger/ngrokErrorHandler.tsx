import React from 'react';
import { TunnelError } from 'packages/app/main/src/state';

export interface ngrokErrorHandlerProps {
  errors: TunnelError;
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
              Try signing up here https://dashboard.ngrok.com/signup and register your auth token as per the steps
              (https://github.com/microsoft/botframework-solutions/issues/2406).
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
        </legend>
      );
    default:
      return (
        <legend>
          Looks like the ngrok tunnel does not exist anymore. Try reconnecting to Ngrok or examine the logs for detailed
          explanation of the error.
        </legend>
      );
  }
};
