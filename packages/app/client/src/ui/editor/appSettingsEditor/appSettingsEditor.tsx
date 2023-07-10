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

import { FrameworkSettings, frameworkDefault } from '@bfemulator/app-shared';
import {
  Checkbox,
  Column,
  LinkButton,
  PrimaryButton,
  Row,
  RowAlignment,
  RowJustification,
  TextField,
} from '@bfemulator/ui-react';
import * as React from 'react';
import { ChangeEvent } from 'react';

import { GenericDocument } from '../../layout';
import { generateHash } from '../../../state/helpers/botHelpers';
import { TunnelCheckTimeInterval, TunnelStatus } from '../../../state/actions/ngrokTunnelActions';
import { NgrokStatusIndicator } from '../ngrokDebugger/ngrokStatusIndicator';

import * as styles from './appSettingsEditor.scss';

export interface AppSettingsEditorProps {
  documentId?: string;
  dirty?: boolean;
  framework?: FrameworkSettings;
  ngrokTunnelStatus?: TunnelStatus;
  ngrokLastPingInterval?: TunnelCheckTimeInterval;

  createAriaAlert?: (msg: string) => void;
  discardChanges?: () => void;
  onAnchorClick?: (url: string) => void;
  openBrowseForNgrok: () => Promise<string>;
  saveFrameworkSettings?: (framework: FrameworkSettings) => void;
  setDirtyFlag?: (dirty: boolean) => void;
  onOpenNgrokStatusViewerClick: () => void;
}

export interface AppSettingsEditorState extends Partial<FrameworkSettings> {
  dirty?: boolean;
  pendingUpdate?: boolean;
}

function shallowEqual(x: any, y: any) {
  return Object.keys(x).length === Object.keys(y).length && Object.keys(x).every(key => key in y && x[key] === y[key]);
}

export class AppSettingsEditor extends React.Component<AppSettingsEditorProps, AppSettingsEditorState> {
  public state = {} as AppSettingsEditorState;
  private pathToNgrokInputRef: HTMLInputElement;

  public static getDerivedStateFromProps(
    newProps: AppSettingsEditorProps,
    prevState: AppSettingsEditorState
  ): AppSettingsEditorState {
    if (newProps.framework.hash === prevState.hash) {
      return prevState;
    }

    return {
      ...newProps.framework,
      dirty: newProps.dirty,
      pendingUpdate: false,
    };
  }

  public componentDidMount(): void {
    if (this.pathToNgrokInputRef) {
      this.pathToNgrokInputRef.focus();
    }
  }
  public render(): JSX.Element {
    const {
      ngrokPath = '',
      useCustomId = false,
      bypassNgrokLocalhost = true,
      runNgrokAtStartup = false,
      localhost = '',
      locale = '',
      use10Tokens = false,
      useCodeValidation = false,
      userGUID = '',
      autoUpdate = false,
      usePrereleases = false,
      collectUsageData = false,
    } = this.state;

    const inputProps = {
      disabled: !useCustomId,
    };

    return (
      <GenericDocument className={styles.appSettingsEditor}>
        <Row>
          <Column className={styles.spacing}>
            <div>
              <span className={styles.legend}>Service</span>
              <p>
                <LinkButton linkRole={true} onClick={this.onNgrokDocsClick}>
                  ngrok
                </LinkButton>{' '}
                is network tunneling software. The Bot Framework Emulator works with ngrok to communicate with bots
                hosted remotely. Read the{' '}
                <LinkButton linkRole={true} onClick={this.onNgrokTunnelingDocsClick}>
                  wiki page
                </LinkButton>{' '}
                to learn more about using ngrok and how to download it.
              </p>
              <Row align={RowAlignment.Center} className={styles.marginBottomRow}>
                <TextField
                  className={styles.appSettingsInput}
                  inputContainerClassName={styles.inputContainer}
                  inputRef={this.setNgrokInputRef}
                  readOnly={false}
                  value={ngrokPath}
                  onChange={this.onInputChange}
                  name="ngrokPath"
                  label={'Path to ngrok'}
                />
                <PrimaryButton onClick={this.onClickBrowse} text="Browse" className={styles.browseButton} />
              </Row>
              <Checkbox
                className={styles.checkboxOverrides}
                checked={bypassNgrokLocalhost}
                onChange={this.onChangeCheckBox}
                id="ngrok-bypass"
                aria-label="Bypass ngrok for local addresses, Service"
                label="Bypass ngrok for local addresses"
                name="bypassNgrokLocalhost"
              />
              <Checkbox
                className={styles.checkboxOverrides}
                checked={runNgrokAtStartup}
                onChange={this.onChangeCheckBox}
                id="ngrok-startup"
                aria-label="Run ngrok when the Emulator starts up, Service"
                label="Run ngrok when the Emulator starts up"
                name="runNgrokAtStartup"
              />
              <Row align={RowAlignment.Center} className={styles.marginBottomRow}>
                <TextField
                  className={styles.appSettingsInput}
                  inputContainerClassName={styles.inputContainer}
                  readOnly={false}
                  value={localhost}
                  onChange={this.onInputChange}
                  name="localhost"
                  label="localhost override"
                />
              </Row>
              <Row align={RowAlignment.Center}>
                <TextField
                  className={styles.appSettingsInput}
                  inputContainerClassName={styles.inputContainer}
                  readOnly={false}
                  value={locale}
                  name="locale"
                  onChange={this.onInputChange}
                  label="Locale"
                />
              </Row>
              <div className={styles.tunnelStatus}>
                <NgrokStatusIndicator
                  tunnelStatus={this.props.ngrokTunnelStatus}
                  timeIntervalSinceLastPing={this.props.ngrokLastPingInterval}
                  header="Tunnel Status"
                />
                <LinkButton linkRole={true} onClick={this.props.onOpenNgrokStatusViewerClick}>
                  Click here to go to the Ngrok Status viewer
                </LinkButton>
              </div>
            </div>
          </Column>
          <Column className={[styles.rightColumn, styles.spacing].join(' ')}>
            <div>
              <span className={styles.legend}>User settings</span>
              <Checkbox
                className={styles.checkboxOverrides}
                checked={use10Tokens}
                onChange={this.onChangeCheckBox}
                id="auth-token-version"
                aria-label="Use version 1.0 authentication tokens, User settings"
                label="Use version 1.0 authentication tokens"
                name="use10Tokens"
              />
              <Checkbox
                className={styles.checkboxOverrides}
                checked={useCodeValidation}
                onChange={this.onChangeCheckBox}
                id="use-validation-code"
                aria-label="Use a sign-in verification code for OAuthCards, User settings"
                label="Use a sign-in verification code for OAuthCards"
                name="useCodeValidation"
              />
              <Checkbox
                className={styles.checkboxOverrides}
                checked={useCustomId}
                onChange={this.onChangeCheckBox}
                id="use-custom-id"
                aria-label="Use your own user ID to communicate with the bot, User settings"
                label="Use your own user ID to communicate with the bot"
                name="useCustomId"
              />

              <Row className={styles.marginBottomRow} align={RowAlignment.Top}>
                <TextField
                  {...inputProps}
                  label="User ID"
                  placeholder={useCustomId ? '' : 'There is no ID configured'}
                  className={styles.appSettingsInput}
                  inputContainerClassName={styles.inputContainer}
                  readOnly={false}
                  value={userGUID}
                  name="userGUID"
                  onChange={this.onInputChange}
                  required={useCustomId}
                  errorMessage={useCustomId && !userGUID ? 'Enter a User ID' : ''}
                />
              </Row>
            </div>

            <div>
              <span className={styles.legend}>Application Updates</span>
              <Checkbox
                className={styles.checkboxOverrides}
                checked={autoUpdate}
                onChange={this.onChangeCheckBox}
                aria-label="Automatically download and install updates, Application Updates"
                label="Automatically download and install updates"
                name="autoUpdate"
              />
              <Checkbox
                className={styles.checkboxOverrides}
                checked={usePrereleases}
                onChange={this.onChangeCheckBox}
                aria-label="Use pre-release versions, Application Updates"
                label="Use pre-release versions"
                name="usePrereleases"
              />
            </div>
            <div>
              <span className={styles.legend}>Data Collection</span>
              <Checkbox
                className={styles.checkboxOverrides}
                checked={collectUsageData}
                onChange={this.onChangeCheckBox}
                aria-label="Help improve the Emulator by allowing us to collect usage data, Data Collection"
                label="Help improve the Emulator by allowing us to collect usage data."
                name="collectUsageData"
              />
              <LinkButton linkRole={true} onClick={this.onPrivacyStatementClick}>
                Privacy statement
              </LinkButton>
            </div>
          </Column>
        </Row>
        <Row className={[styles.buttonRow, styles.spacing].join(' ')} justify={RowJustification.Right}>
          <PrimaryButton text="Cancel" onClick={this.props.discardChanges} className={styles.cancelButton} />
          <PrimaryButton
            text="Save"
            onClick={this.onSaveClick}
            className={styles.saveButton}
            disabled={this.disableSaveButton()}
          />
        </Row>
      </GenericDocument>
    );
  }

  private createAnchorClickHandler = url => () => this.props.onAnchorClick(url);

  private disableSaveButton(): boolean {
    return this.state.useCustomId ? !this.state.userGUID || !this.state.dirty : !this.state.dirty;
  }

  private onChangeCheckBox = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    const change = { [name]: checked };
    this.setState(change);
    if (name === 'useCustomId' && checked === false) {
      this.setState({ userGUID: '' });
    }
    this.updateDirtyFlag(change);
  };

  private onClickBrowse = async (): Promise<void> => {
    const ngrokPath = await this.props.openBrowseForNgrok();
    if (ngrokPath === null) {
      return; // Cancelled browse dialog
    }
    const change = { ngrokPath };
    this.setState(change);
    this.updateDirtyFlag(change);
  };

  private onInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { value, name } = event.target;
    const change = { [name]: value };
    this.setState(change);
    this.updateDirtyFlag(change);
  };

  private onNgrokDocsClick = this.createAnchorClickHandler('https://ngrok.com/');

  private onNgrokTunnelingDocsClick = this.createAnchorClickHandler(
    'https://github.com/Microsoft/BotFramework-Emulator/wiki/Tunneling-(ngrok)'
  );

  private onPrivacyStatementClick = this.createAnchorClickHandler('https://privacy.microsoft.com/privacystatement');

  private onSaveClick = async () => {
    // trim keys that do not belong and generate a hash
    const settings = this.state;
    const keys = Object.keys(frameworkDefault).sort();
    const newState = keys.reduce((s, key) => ((s[key] = settings[key]), s), {}) as FrameworkSettings;
    newState.hash = await generateHash(newState);

    this.setState({ dirty: false });
    this.props.saveFrameworkSettings(newState);
    this.props.createAriaAlert('App settings saved.');
    if (this.pathToNgrokInputRef) {
      this.pathToNgrokInputRef.focus();
    }
  };

  private updateDirtyFlag(change: { [prop: string]: any }) {
    const dirty = !shallowEqual({ ...this.state, ...change }, this.props.framework);
    this.setState({ dirty });
    this.props.setDirtyFlag(dirty);
  }

  private setNgrokInputRef = (ref: HTMLInputElement): void => {
    this.pathToNgrokInputRef = ref;
  };
}
