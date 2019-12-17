import * as React from 'react';
import { Column, Row, LinkButton, LargeHeader } from '@bfemulator/ui-react';
import { GenericDocument } from '../../layout';
import * as styles from './ngrokDebuggerContainer.scss';

export interface ngrokDebugConsoleProps {
  port: string;
  inspectUrl: string;
}

export const NgrokDebuggerContainer = props => {
  const convertToAnchorOnClick = link => {
    this.createAnchorClickHandler(link);
  };

  return (
    <GenericDocument className={styles.ngrokDebuggerContainer}>
      <LargeHeader>Ngrok Debug Console</LargeHeader>
      <Row>
        <Column>
          <section>
            <h2>Tunnel Health</h2>
            <ul className={styles.tunnelDetailsList}>
              <li className={styles.details}>
                <legend>Tunnel Status</legend>
                <span> InActive </span>
                <span className={[styles.tunnelHealthIndicator, styles.healthStatusBad].join(' ')} />
                <span>&nbsp; (December 18th, 2020 2:34:34 PM)</span>
              </li>
              <li className={styles.details}>
                <LinkButton linkRole={true} onClick={() => convertToAnchorOnClick('http://53frcg.io/')}>
                  Click here
                </LinkButton>
                &nbsp;to ping the tunnel now
              </li>

              <li className={styles.details}>
                <div>
                  <legend>Tunnel Errors</legend>
                  <p className={styles.errorWindow}>
                    Too many connections! The tunnel session ‘UaRpp31VV1puVAVWBnIGYLfzZp’ has violated the rate-limit
                    policy of 20 connections per minute by initiating 37 connections in the last 60 seconds. Please
                    decrease your inbound connection volume or upgrade to a paid plan for additional capacity.
                  </p>
                </div>
              </li>
            </ul>
          </section>
          <section>
            <h2>Tunnel Connections</h2>
            <ul className={styles.tunnelDetailsList}>
              <li className={styles.details}>
                <legend> Inspect Url </legend>
                <LinkButton linkRole={true} onClick={() => convertToAnchorOnClick('http://127.0.0.1:4040')}>
                  http://127.0.0.1:4040
                </LinkButton>
              </li>
              <li className={styles.details}>
                <legend>Public Url</legend>
                <LinkButton linkRole={true} onClick={() => convertToAnchorOnClick('http://53frcg.io/')}>
                  http://53frcg.io/
                </LinkButton>
              </li>
              <li className={styles.details}>
                <LinkButton linkRole={true} onClick={() => convertToAnchorOnClick('http://53frcg.io/')}>
                  Click here
                </LinkButton>
                &nbsp;to download the ngrok log file for this session
              </li>

              <li className={styles.details}>
                <LinkButton linkRole={true} onClick={() => convertToAnchorOnClick('http://53frcg.io/')}>
                  Click here
                </LinkButton>
                &nbsp;to download a Postman collection to additionally inspect your tunnels
              </li>
            </ul>
          </section>
        </Column>
      </Row>
    </GenericDocument>
  );
};
