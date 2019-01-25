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

import { FrameworkSettings, newNotification, SharedConstants } from '@bfemulator/app-shared';
import {
  Checkbox,
  Column,
  PrimaryButton,
  Row,
  RowAlignment,
  RowJustification,
  SmallHeader,
  TextField,
} from '@bfemulator/ui-react';
import * as React from 'react';
import { ChangeEvent } from 'react';

import * as Constants from '../../../constants';
import * as EditorActions from '../../../data/action/editorActions';
import { beginAdd } from '../../../data/action/notificationActions';
import { getTabGroupForDocument } from '../../../data/editorHelpers';
import { store } from '../../../data/store';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';
import { debounce } from '../../../utils';
import { GenericDocument } from '../../layout';

import * as styles from './appSettingsEditor.scss';

interface AppSettingsEditorProps {
  documentId?: string;
  dirty?: boolean;
}

interface AppSettingsEditorState {
  committed: FrameworkSettings;
  uncommitted: FrameworkSettings;
}

const defaultAppSettings: FrameworkSettings = {
  autoUpdate: true,
  bypassNgrokLocalhost: true,
  collectUsageData: true,
  locale: '',
  localhost: '',
  ngrokPath: '',
  stateSizeLimit: 64,
  use10Tokens: false,
  useCodeValidation: false,
  usePrereleases: false,
};

function shallowEqual(x: any, y: any) {
  return Object.keys(x).length === Object.keys(y).length && Object.keys(x).every(key => key in y && x[key] === y[key]);
}

export class AppSettingsEditor extends React.Component<AppSettingsEditorProps, AppSettingsEditorState> {
  public setDirtyFlag = debounce(
    dirty => store.dispatch(EditorActions.setDirtyFlag(this.props.documentId, dirty)),
    300
  );

  public constructor(props: AppSettingsEditorProps, context: any) {
    super(props, context);

    this.state = {
      committed: { ...defaultAppSettings },
      uncommitted: { ...defaultAppSettings },
    };
  }

  public componentWillMount(): void {
    const { Commands } = SharedConstants;
    // load settings from main and populate form
    CommandServiceImpl.remoteCall(Commands.Settings.LoadAppSettings)
      .then(settings => {
        this.setState(() => ({
          committed: settings,
          uncommitted: settings,
        }));
      })
      .catch(err => {
        const errMsg = `Error while loading emulator settings: ${err}`;
        const notification = newNotification(errMsg);
        store.dispatch(beginAdd(notification));
      });
  }

  public commit(committed: any) {
    this.setState(() => {
      this.setDirtyFlag(false);

      return {
        committed: { ...committed },
        uncommitted: { ...committed },
      };
    });
  }

  public render(): JSX.Element {
    const { uncommitted } = this.state;
    const clean = shallowEqual(this.state.committed, uncommitted);

    return (
      <GenericDocument className={styles.appSettingsEditor}>
        <Row>
          <Column className={styles.spacing}>
            <SmallHeader>Service</SmallHeader>
            <p>
              <a href="https://ngrok.com/" target="_blank" rel="noopener noreferrer">
                ngrok
              </a>{' '}
              is network tunneling software. The Bot Framework Emulator works with ngrok to communicate with bots hosted
              remotely. Read the{' '}
              <a
                href="https://github.com/Microsoft/BotFramework-Emulator/wiki/Tunneling-(ngrok)"
                target="_blank"
                rel="noopener noreferrer"
              >
                wiki page
              </a>{' '}
              to learn more about using ngrok and to download it.
            </p>
            <Row align={RowAlignment.Center} className={styles.marginBottomRow}>
              <TextField
                className={styles.appSettingsInput}
                inputContainerClassName={styles.inputContainer}
                readOnly={false}
                value={uncommitted.ngrokPath}
                onChange={this.onInputChange}
                data-prop="ngrokPath"
                label={'Path to ngrok'}
              />
              <PrimaryButton onClick={this.onClickBrowse} text="Browse" className={styles.browseButton} />
            </Row>
            <Checkbox
              className={styles.checkboxOverrides}
              checked={uncommitted.bypassNgrokLocalhost}
              onChange={this.onChangeCheckBox}
              id="ngrok-bypass"
              label="Bypass ngrok for local addresses"
              name="bypassNgrokLocalhost"
            />
            <Row align={RowAlignment.Center} className={styles.marginBottomRow}>
              <TextField
                className={styles.appSettingsInput}
                inputContainerClassName={styles.inputContainer}
                readOnly={false}
                value={uncommitted.localhost}
                onChange={this.onInputChange}
                data-prop="localhost"
                label="localhost override"
              />
            </Row>
            <Row align={RowAlignment.Center}>
              <TextField
                className={styles.appSettingsInput}
                inputContainerClassName={styles.inputContainer}
                readOnly={false}
                value={uncommitted.locale}
                data-prop="locale"
                onChange={this.onInputChange}
                label="Locale"
              />
            </Row>
          </Column>
          <Column className={[styles.rightColumn, styles.spacing].join(' ')}>
            <SmallHeader>Auth</SmallHeader>
            <Checkbox
              className={styles.checkboxOverrides}
              checked={uncommitted.use10Tokens}
              onChange={this.onChangeCheckBox}
              id="auth-token-version"
              label="Use version 1.0 authentication tokens"
              name="use10Tokens"
            />
            <SmallHeader>Sign-in</SmallHeader>
            <Checkbox
              className={styles.checkboxOverrides}
              checked={uncommitted.useCodeValidation}
              onChange={this.onChangeCheckBox}
              id="use-validation-code"
              label="Use a sign-in verification code for OAuthCards"
              name="useCodeValidation"
            />
            <SmallHeader>Application Updates</SmallHeader>
            <Checkbox
              className={styles.checkboxOverrides}
              checked={uncommitted.autoUpdate}
              onChange={this.onChangeCheckBox}
              label="Automatically download and install updates"
              name="autoUpdate"
            />
            <Checkbox
              className={styles.checkboxOverrides}
              checked={uncommitted.usePrereleases}
              onChange={this.onChangeCheckBox}
              label="Use pre-release versions"
              name="usePrereleases"
            />
            <SmallHeader>Data Collection</SmallHeader>
            <Checkbox
              className={styles.checkboxOverrides}
              checked={uncommitted.collectUsageData}
              onChange={this.onChangeCheckBox}
              label="Help improve the Emulator by allowing us to collect usage data."
              name="collectUsageData"
            />
            <a target="_blank" href="https://aka.ms/bot-framework-emulator-data-collection" rel="noopener noreferrer">
              Learn more.
            </a>
          </Column>
        </Row>
        <Row className={styles.buttonRow} justify={RowJustification.Right}>
          <PrimaryButton text="Cancel" onClick={this.onClickDiscard} className={styles.cancelButton} />
          <PrimaryButton text="Save" onClick={this.onClickSave} className={styles.saveButton} disabled={clean} />
        </Row>
      </GenericDocument>
    );
  }

  private onChangeCheckBox = (event: ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const settingsProperty = target.getAttribute('name');
    const uncommittedState = Object.create(
      {},
      {
        [settingsProperty]: {
          get: () => !this.state.uncommitted[settingsProperty],
          enumerable: true, // important since rest spread is used.
        },
      }
    );
    this.setUncommittedState(uncommittedState);
  };

  private setUncommittedState(patch: any) {
    this.setState(state => {
      const nextUncommitted = {
        ...state.uncommitted,
        ...patch,
      };

      const clean = shallowEqual(state.uncommitted, state.committed);
      const nextClean = shallowEqual(nextUncommitted, state.committed);

      if (nextClean !== clean) {
        this.setDirtyFlag(!nextClean);
      }

      return { uncommitted: nextUncommitted };
    });
  }

  private onClickBrowse = (): void => {
    const { Commands } = SharedConstants;
    const dialogOptions = {
      title: 'Browse for ngrok',
      buttonLabel: 'Select ngrok',
      properties: ['openFile'],
    };

    CommandServiceImpl.remoteCall(Commands.Electron.ShowOpenDialog, dialogOptions)
      .then(ngrokPath => this.setUncommittedState({ ngrokPath }))
      .catch(err => {
        const errMsg = `Error while browsing for ngrok: ${err}`;
        const notification = newNotification(errMsg);
        store.dispatch(beginAdd(notification));
      });
  };

  private onClickSave = (): void => {
    const { Commands } = SharedConstants;
    const { uncommitted } = this.state;
    const settings: FrameworkSettings = {
      ngrokPath: uncommitted.ngrokPath.trim(),
      bypassNgrokLocalhost: uncommitted.bypassNgrokLocalhost,
      stateSizeLimit: +uncommitted.stateSizeLimit,
      use10Tokens: uncommitted.use10Tokens,
      useCodeValidation: uncommitted.useCodeValidation,
      localhost: uncommitted.localhost.trim(),
      locale: uncommitted.locale.trim(),
      usePrereleases: uncommitted.usePrereleases,
      autoUpdate: uncommitted.autoUpdate,
      collectUsageData: uncommitted.collectUsageData,
    };

    CommandServiceImpl.remoteCall(Commands.Settings.SaveAppSettings, settings)
      .then(() => this.commit(settings))
      .catch(err => {
        const errMsg = `Error while saving emulator settings: ${err}`;
        const notification = newNotification(errMsg);
        store.dispatch(beginAdd(notification));
      });
  };

  private onInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;
    const { prop } = event.target.dataset;
    this.setUncommittedState({ [prop]: value });
  };

  private onClickDiscard = (): void => {
    const { DOCUMENT_ID_APP_SETTINGS } = Constants;
    store.dispatch(EditorActions.close(getTabGroupForDocument(this.props.documentId), DOCUMENT_ID_APP_SETTINGS));
  };
}
