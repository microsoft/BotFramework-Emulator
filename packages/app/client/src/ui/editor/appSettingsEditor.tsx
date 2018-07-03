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

import * as React from 'react';
import { css } from 'glamor';

import { FrameworkSettings, SharedConstants } from '@bfemulator/app-shared';
import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';
import {
  Checkbox,
  Colors,
  Column,
  PrimaryButton,
  Row,
  RowAlignment,
  RowJustification,
  SmallHeader,
  TextInputField
} from '@bfemulator/ui-react';
import * as EditorActions from '../../data/action/editorActions';
import * as Constants from '../../constants';
import store from '../../data/store';
import { getTabGroupForDocument } from '../../data/editorHelpers';
import { GenericDocument } from '../layout';
import { debounce } from '../../utils';

const CSS = css({
  '& .right-column': {
    marginLeft: '48px'
  },

  '& p': {
    margin: 0,
    marginBottom: '16px'
  },

  '& a': {
    textDecoration: 'none',
    color: Colors.APP_HYPERLINK_FOREGROUND_DARK,

    ':hover': {
      color: Colors.APP_HYPERLINK_FOREGROUND_DARK
    }
  },

  '& .button-row': {
    marginTop: '48px'
  },

  '& .browse-button, & .save-button': {
    marginLeft: '8px'
  },

  '& .size-limit-suffix': {
    display: 'inline-block',
    lineHeight: '32px',
    marginLeft: '8px'
  },

  '& .checkboxOverrides': {
    marginBottom: '16px',

    // TODO: Need light / dark theming
    // https://github.com/Microsoft/BotFramework-Emulator/issues/496
    '& > label': {
      color: Colors.APP_FOREGROUND_DARK
    }
  },

  '& .app-settings-input': {
    color: Colors.APP_FOREGROUND_DARK
  }
});

interface AppSettingsEditorProps {
  documentId?: string;
  dirty?: boolean;
}

interface AppSettingsEditorState {
  committed: FrameworkSettings;
  uncommitted: FrameworkSettings;
}

const defaultAppSettings: FrameworkSettings = {
  bypassNgrokLocalhost: true,
  locale: '',
  localhost: '',
  ngrokPath: '',
  stateSizeLimit: 64,
  use10Tokens: false,
  useCodeValidation: false
};

function shallowEqual(x: any, y: any) {
  return (
    Object.keys(x).length === Object.keys(y).length
    && Object.keys(x).every(key => key in y && x[key] === y[key])
  );
}

export class AppSettingsEditor extends React.Component<AppSettingsEditorProps, AppSettingsEditorState> {
  setDirtyFlag = debounce((dirty) => store.dispatch(EditorActions.setDirtyFlag(this.props.documentId, dirty)), 300);

  constructor(props: AppSettingsEditorProps, context: any) {
    super(props, context);

    this.onClickBrowse = this.onClickBrowse.bind(this);
    this.onChangeSizeLimit = this.onChangeSizeLimit.bind(this);
    this.onClickSave = this.onClickSave.bind(this);
    this.onChangeNgrok = this.onChangeNgrok.bind(this);
    this.onChangeNgrokBypass = this.onChangeNgrokBypass.bind(this);
    this.onChangeAuthTokenVersion = this.onChangeAuthTokenVersion.bind(this);
    this.onChangeUseValidationToken = this.onChangeUseValidationToken.bind(this);
    this.onClickDiscard = this.onClickDiscard.bind(this);
    this.onChangeLocalhost = this.onChangeLocalhost.bind(this);
    this.onChangeLocale = this.onChangeLocale.bind(this);

    this.state = {
      committed: { ...defaultAppSettings },
      uncommitted: { ...defaultAppSettings }
    };
  }

  componentWillMount(): void {
    // load settings from main and populate form
    CommandServiceImpl.remoteCall(SharedConstants.Commands.Settings.LoadAppSettings)
      .then(settings => {
        this.setState(() => ({
          committed: settings,
          uncommitted: settings
        }));
      })
      .catch(err => console.error('Error while loading emulator settings: ', err));
  }

  setUncommittedState(patch: any) {
    this.setState(state => {
      const nextUncommitted = {
        ...state.uncommitted,
        ...patch
      };

      const clean = shallowEqual(state.uncommitted, state.committed);
      const nextClean = shallowEqual(nextUncommitted, state.committed);

      if (nextClean !== clean) {
        this.setDirtyFlag(!nextClean);
      }

      return { uncommitted: nextUncommitted };
    });
  }

  commit(committed: any) {
    this.setState(() => {
      this.setDirtyFlag(false);

      return {
        committed: { ...committed },
        uncommitted: { ...committed }
      };
    });
  }

  onClickBrowse(): void {
    const dialogOptions = {
      title: 'Browse for ngrok',
      buttonLabel: 'Select ngrok',
      properties: ['openFile']
    };

    CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.ShowOpenDialog, dialogOptions)
      .then(ngrokPath => this.setUncommittedState({ ngrokPath }))
      .catch(err => console.log('User cancelled browsing for ngrok: ', err));
  }

  onChangeSizeLimit(e: any): void {
    this.setUncommittedState({ stateSizeLimit: e.target.value });
  }

  onClickSave(): void {
    const { uncommitted } = this.state;
    const settings: FrameworkSettings = {
      ngrokPath: uncommitted.ngrokPath.trim(),
      bypassNgrokLocalhost: uncommitted.bypassNgrokLocalhost,
      stateSizeLimit: +uncommitted.stateSizeLimit,
      use10Tokens: uncommitted.use10Tokens,
      useCodeValidation: uncommitted.useCodeValidation,
      localhost: uncommitted.localhost.trim(),
      locale: uncommitted.locale.trim()
    };

    CommandServiceImpl.remoteCall(SharedConstants.Commands.Settings.SaveAppSettings, settings)
      .then(() => this.commit(settings))
      .catch(err => console.error('Error while saving emulator settings: ', err));
  }

  onChangeAuthTokenVersion(): void {
    this.setUncommittedState({ use10Tokens: !this.state.uncommitted.use10Tokens });
  }

  onChangeUseValidationToken(): void {
    this.setUncommittedState({ useCodeValidation: !this.state.uncommitted.useCodeValidation });
  }

  onChangeNgrok(ngrokPath: string): void {
    this.setUncommittedState({ ngrokPath });
  }

  onChangeNgrokBypass(): void {
    this.setUncommittedState({ bypassNgrokLocalhost: !this.state.uncommitted.bypassNgrokLocalhost });
  }

  onChangeLocalhost(localhost: string): void {
    this.setUncommittedState({ localhost });
  }

  onChangeLocale(locale: string): void {
    this.setUncommittedState({ locale });
  }

  onClickDiscard(): void {
    const { DOCUMENT_ID_APP_SETTINGS } = Constants;
    store.dispatch(EditorActions.close(getTabGroupForDocument(this.props.documentId), DOCUMENT_ID_APP_SETTINGS));
  }

  render(): JSX.Element {
    const { uncommitted } = this.state;
    const clean = shallowEqual(this.state.committed, uncommitted);

    return (
      <GenericDocument style={CSS}>
        <Row>
          <Column>
            <SmallHeader>Service</SmallHeader>
            <p><a href="https://ngrok.com/" target="_blank">ngrok</a> is network tunneling software. The Bot Framework
              Emulator works with ngrok to communicate with bots hosted remotely. Read the <a
                href="https://github.com/Microsoft/BotFramework-Emulator/wiki/Tunneling-(ngrok)" target="_blank">wiki
                page</a> to learn more about using ngrok and to download it.</p>
            <Row align={RowAlignment.Center}>
              <TextInputField className="app-settings-input" readOnly={false} value={uncommitted.ngrokPath}
                onChanged={this.onChangeNgrok} label={'Path to ngrok'} />
              <PrimaryButton onClick={this.onClickBrowse} text="Browse" className="browse-button" />
            </Row>
            <Checkbox className="checkboxOverrides" checked={uncommitted.bypassNgrokLocalhost}
              onChange={this.onChangeNgrokBypass} id="ngrok-bypass" label="Bypass ngrok for local addresses" />
            <Row align={RowAlignment.Center}>
              <TextInputField className="app-settings-input" readOnly={false} value={uncommitted.localhost}
                onChanged={this.onChangeLocalhost} label="localhost override" />
            </Row>
            <Row align={RowAlignment.Center}>
              <TextInputField className="app-settings-input" readOnly={false} value={uncommitted.locale}
                onChanged={this.onChangeLocale} label="Locale" />
            </Row>
          </Column>
          <Column className="right-column">
            <SmallHeader>Auth</SmallHeader>
            <Checkbox className="checkboxOverrides" checked={uncommitted.use10Tokens}
              onChange={this.onChangeAuthTokenVersion} id="auth-token-version"
              label="Use version 1.0 authentication tokens" />
            <SmallHeader>Sign-in</SmallHeader>
            <Checkbox className="checkboxOverrides" checked={uncommitted.useCodeValidation}
              onChange={this.onChangeUseValidationToken} id="use-validation-code"
              label="Use a sign-in verification code for OAuthCards" />
          </Column>
        </Row>
        <Row className="button-row" justify={RowJustification.Right}>
          <PrimaryButton text="Cancel" onClick={this.onClickDiscard} />
          <PrimaryButton text="Save" onClick={this.onClickSave} className="save-button" disabled={clean} />
        </Row>
      </GenericDocument>
    );
  }
}
