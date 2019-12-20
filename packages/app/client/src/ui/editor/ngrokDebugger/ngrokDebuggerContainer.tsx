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
}

const dialogOptions: Electron.SaveDialogOptions = {
  title: 'Save Postman collection to disk',
  buttonLabel: 'Save',
};

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
      <section className={styles.errorDetailedViewer}>
        <NgrokErrorHandler errors={props.errors} />
      </section>
    ) : null;

  const tunnelConnections = (
    <section>
      <h2>Tunnel Connections</h2>
      <ul className={styles.tunnelDetailsList}>
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
            linkRole={true}
            onClick={() => props.onSaveFileClick(props.logPath, dialogOptions)}
          >
            Click here
          </LinkButton>
          &nbsp;to download the ngrok log file for this session
        </li>
        <li>
          <LinkButton
            ariaLabel="Download postman collection&nbsp;"
            linkRole={true}
            onClick={() => props.onSaveFileClick(props.postmanCollectionPath, dialogOptions)}
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
              <li>
                <LinkButton linkRole={true} onClick={props.onPingTunnelClick}>
                  Click here
                </LinkButton>
                &nbsp;to ping the tunnel nows
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
    console.error('An error occured trying to save the file to disk');
  }
};

const mapDispatchToProps = (dispatch: (action: Action) => void) => ({
  onAnchorClick: (url: string) =>
    dispatch(executeCommand(true, SharedConstants.Commands.Electron.OpenExternal, null, url)),
  onPingTunnelClick: () => dispatch(executeCommand(true, SharedConstants.Commands.Ngrok.PingTunnel, null)),
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
