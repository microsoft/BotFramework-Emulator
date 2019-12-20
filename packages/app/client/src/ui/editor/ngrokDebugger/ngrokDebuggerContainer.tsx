import * as React from 'react';
import { connect } from 'react-redux';
import { Action } from 'redux';
import { Column, Row, LinkButton, LargeHeader } from '@bfemulator/ui-react';
import { SharedConstants } from '@bfemulator/app-shared';
import { RootState } from '../../../state/store';
import { TunnelError } from '../../../state';
import { executeCommand } from '../../../state/actions/commandActions';
import { GenericDocument } from '../../layout';
import * as styles from './ngrokDebuggerContainer.scss';

export interface NgrokDebuggerProps {
  inspectUrl: string;
  errors: TunnelError;
  publicUrl: string;
  logPath: string;
  postmanCollectionPath: string;
  onAnchorClick: any;
  onSaveFileClick: any;
}

const dialogOptions: Electron.SaveDialogOptions = {
  title: 'Save Postman collection to disk',
  buttonLabel: 'Save',
};

export const NgrokDebugger = (props: NgrokDebuggerProps) => {
  const convertToAnchorOnClick = (link: string) => {
    props.onAnchorClick(link);
  };

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
      <LargeHeader>Ngrok Debug Console</LargeHeader>
      <Row>
        <Column>
          <section>
            <h2>Tunnel Health</h2>
            <ul className={styles.tunnelDetailsList}>
              <li>
                <legend>Tunnel Status</legend>
                <span> InActive </span>
                <span className={[styles.tunnelHealthIndicator, styles.healthStatusBad].join(' ')} />
                <span>&nbsp; (December 18th, 2020 2:34:34 PM)</span>
              </li>
              <li>
                <LinkButton linkRole={true} onClick={() => convertToAnchorOnClick('http://53frcg.io/')}>
                  Click here
                </LinkButton>
                &nbsp;to ping the tunnel now
              </li>
              <li>
                <div>
                  <legend>Tunnel Errors</legend>
                  <p className={styles.errorWindow}>Test</p>
                </div>
              </li>
            </ul>
          </section>
          {props.publicUrl ? tunnelConnections : null}
        </Column>
      </Row>
    </GenericDocument>
  );
};

const mapStateToProps = (state: RootState, ownProps: {}): Partial<NgrokDebuggerProps> => {
  const { inspectUrl, errors, publicUrl, logPath, postmanCollectionPath } = state.ngrokTunnel;

  return {
    inspectUrl,
    errors,
    publicUrl,
    logPath,
    postmanCollectionPath,
    ...ownProps,
  };
};

const onFileSaveCb = (result: boolean) => {
  if (!result) {
    console.error('An error occured trying to save the file to disk');
  }
};

const mapDispatchToProps = (dispatch: (action: Action) => void) => ({
  onAnchorClick: (url: string) => {
    dispatch(executeCommand(true, SharedConstants.Commands.Electron.OpenExternal, null, url));
  },
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
