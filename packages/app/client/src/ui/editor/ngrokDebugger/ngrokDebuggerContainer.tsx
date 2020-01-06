import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Action } from 'redux';
import { Column, Row, LinkButton, LargeHeader } from '@bfemulator/ui-react';
import NgrokErrorHandler from './ngrokErrorHandler';
import { SharedConstants } from '@bfemulator/app-shared';
import { RootState } from '../../../state/store';
import { TunnelError, TunnelStatus } from '../../../state';
import { executeCommand } from '../../../state/actions/commandActions';
import { GenericDocument } from '../../layout';
import * as styles from './ngrokDebuggerContainer.scss';

export interface NgrokDebuggerProps {
  inspectUrl: string;
  errors: TunnelError;
  publicUrl: string;
  logPath: string;
  postmanCollectionPath: string;
  tunnelStatus: TunnelStatus;
  lastTunnelStatusCheckTS: string;
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
  const [statusDisplay, setStatusDisplay] = useState(styles.tunnelInactive);

  const convertToAnchorOnClick = (link: string) => {
    props.onAnchorClick(link);
  };

  useEffect(() => {
    switch (props.tunnelStatus) {
      case TunnelStatus.Active:
        setStatusDisplay(styles.tunnelActive);
        break;
      case TunnelStatus.Error:
        setStatusDisplay(styles.tunnelError);
        break;
      default:
        setStatusDisplay(styles.tunnelInactive);
        break;
    }
  }, [props.lastTunnelStatusCheckTS]);

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
      <h2>Tunnel Connections</h2>
      <ul>
        <li>
          <legend> Inspect Url </legend>
          <LinkButton
            ariaLabel="Ngrok Inspect Url.&nbsp;"
            linkRole={true}
            onClick={() => convertToAnchorOnClick(props.inspectUrl)}
          >
            {props.inspectUrl}
          </LinkButton>
        </li>
        <li>
          <legend>Public Url</legend>
          <LinkButton
            ariaLabel="Ngrok Public Url.&nbsp;"
            linkRole={true}
            onClick={() => convertToAnchorOnClick(props.publicUrl)}
          >
            {props.publicUrl}
          </LinkButton>
        </li>
        <li>
          <LinkButton
            ariaLabel="Download Log file.&nbsp;"
            linkRole={false}
            onClick={() => props.onSaveFileClick(props.logPath, getDialogOptions('Save log file to disk.'))}
          >
            Click here
          </LinkButton>
          &nbsp;to download the ngrok log file for this session
        </li>
        <li>
          <LinkButton
            ariaLabel="Download postman collection&nbsp;"
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
      <LargeHeader>Ngrok Debug Viewer</LargeHeader>
      <Row>
        <Column>
          <section>
            <h2>Tunnel Health</h2>
            <ul className={styles.tunnelDetailsList}>
              <li>
                <legend>Tunnel Status</legend>
                <span className={[styles.tunnelHealthIndicator, statusDisplay].join(' ')} />
                <span>{props.lastTunnelStatusCheckTS}</span>
              </li>
              {props.tunnelStatus !== TunnelStatus.Inactive ? (
                <li>
                  <LinkButton linkRole={true} onClick={props.onPingTunnelClick}>
                    Click here
                  </LinkButton>
                  &nbsp;to ping the tunnel now
                </li>
              ) : null}
              {errorDetailsContainer}
            </ul>
          </section>
          {props.publicUrl ? tunnelConnections : null}
        </Column>
      </Row>
    </GenericDocument>
  );
};

const mapStateToProps = (state: RootState, ownProps: {}): Partial<NgrokDebuggerProps> => {
  const {
    inspectUrl,
    errors,
    publicUrl,
    logPath,
    postmanCollectionPath,
    tunnelStatus,
    lastTunnelStatusCheckTS,
  } = state.ngrokTunnel;

  return {
    inspectUrl,
    errors,
    publicUrl,
    logPath,
    postmanCollectionPath,
    tunnelStatus,
    lastTunnelStatusCheckTS,
    ...ownProps,
  };
};

const onFileSaveCb = (result: boolean) => {
  if (!result) {
    // TODO: Show error dialog here
    console.error('An error occured trying to save the file to disk');
  }
};

const mapDispatchToProps = (dispatch: (action: Action) => void) => ({
  onAnchorClick: (url: string) =>
    dispatch(executeCommand(true, SharedConstants.Commands.Electron.OpenExternal, null, url)),
  onPingTunnelClick: () => dispatch(executeCommand(true, SharedConstants.Commands.Ngrok.PingTunnel, null)),
  onReconnectToNgrokClick: () => dispatch(executeCommand(true, SharedConstants.Commands.Ngrok.Reconnect, null)),
  onSaveFileClick: (originalFilePath: string, dialogOptions: Electron.SaveDialogOptions) => {
    dispatch(
      executeCommand(
        true,
        SharedConstants.Commands.Electron.ShowSaveDialog,
        (newFilePath: string) => {
          dispatch(
            executeCommand(
              true,
              SharedConstants.Commands.Electron.CopyFile,
              onFileSaveCb,
              originalFilePath,
              newFilePath
            )
          );
        },
        dialogOptions
      )
    );
  },
});

export const NgrokDebuggerContainer = connect(mapStateToProps, mapDispatchToProps)(NgrokDebugger);
