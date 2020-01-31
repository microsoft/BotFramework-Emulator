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
import { Column, Row, LinkButton, MediumHeader, SmallHeader } from '@bfemulator/ui-react';
import { TunnelCheckTimeInterval, TunnelError, TunnelStatus } from '@bfemulator/app-shared';

import { GenericDocument } from '../../layout';

import { NgrokErrorHandler } from './ngrokErrorHandler';
import * as styles from './ngrokDebuggerContainer.scss';
import { NgrokStatusIndicator } from './ngrokStatusIndicator';

export interface NgrokDebuggerProps {
  inspectUrl: string;
  errors: TunnelError;
  publicUrl: string;
  logPath: string;
  postmanCollectionPath: string;
  tunnelStatus: TunnelStatus;
  lastPingedTimestamp: number;
  timeIntervalSinceLastPing: TunnelCheckTimeInterval;
  onAnchorClick: (linkRef: string) => void;
  onSaveFileClick: (originalFilePath: string, dialogOptions: Electron.SaveDialogOptions) => void;
  onPingTunnelClick: () => void;
  onReconnectToNgrokClick: () => void;
}

const getDialogOptions = (title: string, buttonLabel: string = 'Save'): Electron.SaveDialogOptions => ({
  title,
  buttonLabel,
});

export const NgrokDebugger = (props: NgrokDebuggerProps) => {
  const convertToAnchorOnClick = (link: string) => {
    props.onAnchorClick(link);
  };

  const errorDetailsContainer =
    props.tunnelStatus === TunnelStatus.Error ? (
      <div className={styles.errorDetailedViewer}>
        <NgrokErrorHandler
          errors={props.errors}
          onExternalLinkClick={convertToAnchorOnClick}
          onReconnectToNgrokClick={props.onReconnectToNgrokClick}
        />
      </div>
    ) : null;

  const tunnelConnections = (
    <section>
      <SmallHeader>Tunnel Connections</SmallHeader>
      <ul className={styles.tunnelDetailsList}>
        <li>
          <legend>Inspect Url</legend>
          <LinkButton
            ariaLabel="Ngrok Inspect Url."
            linkRole={true}
            onClick={() => convertToAnchorOnClick(props.inspectUrl)}
          >
            {props.inspectUrl}
          </LinkButton>
        </li>
        <li>
          <legend>Public Url</legend>
          <LinkButton
            ariaLabel="Ngrok Public Url."
            linkRole={true}
            onClick={() => convertToAnchorOnClick(props.publicUrl)}
          >
            {props.publicUrl}
          </LinkButton>
        </li>
        <li>
          <LinkButton
            ariaLabel="Download Log file."
            linkRole={false}
            onClick={() => props.onSaveFileClick(props.logPath, getDialogOptions('Save log file to disk.'))}
          >
            Click here
          </LinkButton>
          &nbsp;to download the ngrok log file for this tunnel session
        </li>
        <li>
          <LinkButton
            ariaLabel="Download postman collection."
            linkRole={false}
            onClick={() =>
              props.onSaveFileClick(props.postmanCollectionPath, getDialogOptions('Save Postman collection to disk.'))
            }
          >
            Click here
          </LinkButton>
          &nbsp;to download a Postman collection to additionally inspect your tunnels
        </li>
      </ul>
    </section>
  );

  return (
    <GenericDocument className={styles.ngrokDebuggerContainer}>
      <MediumHeader>Ngrok Status Viewer</MediumHeader>
      <Row>
        <Column>
          <section>
            <SmallHeader>Tunnel Health</SmallHeader>
            <ul className={styles.tunnelDetailsList}>
              <li>
                <span>
                  <NgrokStatusIndicator
                    tunnelStatus={props.tunnelStatus}
                    timeIntervalSinceLastPing={props.timeIntervalSinceLastPing}
                    header="Tunnel Status"
                  />
                </span>
              </li>
              <li>
                <LinkButton linkRole={true} onClick={props.onPingTunnelClick}>
                  Click here
                </LinkButton>
                &nbsp;to ping the tunnel now
              </li>
              {errorDetailsContainer}
            </ul>
          </section>
          {props.publicUrl ? tunnelConnections : null}
        </Column>
      </Row>
    </GenericDocument>
  );
};
