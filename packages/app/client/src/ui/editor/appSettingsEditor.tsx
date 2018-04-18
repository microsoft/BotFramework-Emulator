import * as React from 'react';
import { css } from 'glamor';
import { debounce } from 'lodash';

import { IFrameworkSettings } from '@bfemulator/app-shared';
import { CommandService } from '../../platform/commands/commandService';
import { Colors } from '@bfemulator/ui-react';
import * as EditorActions from '../../data/action/editorActions';
import * as Constants from '../../constants';
import store from '../../data/store';
import { getTabGroupForDocument } from '../../data/editorHelpers';
import { GenericDocument } from '../layout';
import { Column, ColumnAlignment, Row, RowAlignment, RowJustification, Checkbox, NumberInputField, TextInputField, PrimaryButton, MediumHeader, SmallHeader } from '@bfemulator/ui-react';

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
  }
});

interface IAppSettingsEditorProps {
  documentId?: string;
  dirty?: boolean;
}

interface IAppSettingsEditorState {
  committed: IFrameworkSettings;
  uncommitted: IFrameworkSettings;
};

const defaultAppSettings: IFrameworkSettings = {
  bypassNgrokLocalhost: true,
  locale: '',
  localhost: '',
  ngrokPath: '',
  stateSizeLimit: 64,
  use10Tokens: false
}

function shallowEqual(x, y) {
  return (
    Object.keys(x).length === Object.keys(y).length
    && Object.keys(x).every(key => key in y && x[key] === y[key])
  );
}

export default class AppSettingsEditor extends React.Component<IAppSettingsEditorProps, IAppSettingsEditorState> {
  constructor(props: IAppSettingsEditorProps, context: any) {
    super(props, context);

    this.onClickBrowse = this.onClickBrowse.bind(this);
    this.onChangeSizeLimit = this.onChangeSizeLimit.bind(this);
    this.onClickSave = this.onClickSave.bind(this);
    this.onChangeNgrok = this.onChangeNgrok.bind(this);
    this.onChangeNgrokBypass = this.onChangeNgrokBypass.bind(this);
    this.onChangeAuthTokenVersion = this.onChangeAuthTokenVersion.bind(this);
    this.setDirtyFlag = debounce(this.setDirtyFlag, 300);
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
    CommandService.remoteCall('app:settings:load')
      .then(settings => {
        this.setState(() => ({
          committed: settings,
          uncommitted: settings
        }));
      })
      .catch(err => console.error('Error while loading app settings: ', err));
  }

  setUncommittedState(patch) {
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

  commit(committed) {
    this.setState(state => {
      this.setDirtyFlag(false);

      return {
        committed: { ...committed },
        uncommitted: { ...committed }
      };
    });
  }

  onClickBrowse(e): void {
    const dialogOptions = {
      title: 'Browse for ngrok',
      buttonLabel: 'Select ngrok',
      properties: ['openFile']
    };

    CommandService.remoteCall('shell:showOpenDialog', dialogOptions)
      .then(ngrokPath => this.setUncommittedState({ ngrokPath }))
      .catch(err => console.log('User cancelled browsing for ngrok: ', err));
  }

  onChangeSizeLimit(e): void {
    this.setUncommittedState({ stateSizeLimit: e.target.value });
  }

  onClickSave(e): void {
    const { uncommitted } = this.state;
    const settings: IFrameworkSettings = {
      ngrokPath: uncommitted.ngrokPath.trim(),
      bypassNgrokLocalhost: uncommitted.bypassNgrokLocalhost,
      stateSizeLimit: +uncommitted.stateSizeLimit,
      use10Tokens: uncommitted.use10Tokens,
      localhost: uncommitted.localhost.trim(),
      locale: uncommitted.locale.trim()
    };

    CommandService.remoteCall('app:settings:save', settings)
      .then(() => this.commit(settings))
      .catch(err => console.error('Error while saving app settings: ', err));
  }

  onChangeAuthTokenVersion(e): void {
    this.setUncommittedState({ use10Tokens: !this.state.uncommitted.use10Tokens });
  }

  onChangeNgrok(e): void {
    this.setUncommittedState({ ngrokPath: e.target.value });
  }

  onChangeNgrokBypass(e): void {
    this.setUncommittedState({ bypassNgrokLocalhost: !this.state.uncommitted.bypassNgrokLocalhost });
  }

  onChangeLocalhost(e): void {
    this.setUncommittedState({ localhost: e.target.value });
  }

  onChangeLocale(e): void {
    this.setUncommittedState({ locale: e.target.value });
  }

  setDirtyFlag(dirty): void {
    store.dispatch(EditorActions.setDirtyFlag(this.props.documentId, dirty));
  }

  onClickDiscard(e): void {
    store.dispatch(EditorActions.close(getTabGroupForDocument(this.props.documentId), Constants.DocumentId_AppSettings));
  }

  render(): JSX.Element {
    const { uncommitted } = this.state;
    const clean = shallowEqual(this.state.committed, uncommitted);

    return (
      <GenericDocument style={ CSS }>
        <MediumHeader>App settings</MediumHeader>
        <Row>
          <Column>
            <SmallHeader>Service settings</SmallHeader>
            <p><a href="https://ngrok.com/" target="_blank">ngrok</a> is network tunneling software. The Bot Framework Emulator works with ngrok to communicate with bots hosted remotely. Read the <a href="https://github.com/Microsoft/BotFramework-Emulator/wiki/Tunneling-(ngrok)" target="_blank">wiki page</a> to learn more about using ngrok and to download it.</p>
            <Row align={ RowAlignment.Center }>
              <TextInputField readOnly={ false } value={ uncommitted.ngrokPath } onChange={ this.onChangeNgrok } label={ 'Path to ngrok' } />
              <PrimaryButton onClick={ this.onClickBrowse } text="Browse" className="browse-button" />
            </Row>
            <Checkbox checked={ uncommitted.bypassNgrokLocalhost } onChange={ this.onChangeNgrokBypass } id="ngrok-bypass" label="Bypass ngrok for local addresses" />
            <Checkbox checked={ uncommitted.use10Tokens } onChange={ this.onChangeAuthTokenVersion } id="auth-token-version" label="Use version 1.0 authentication tokens" />
            <Row align={ RowAlignment.Center }>
              <TextInputField readOnly={ false } value={ uncommitted.localhost } onChange={ this.onChangeLocalhost } label="localhost override" />
            </Row>
            <Row align={ RowAlignment.Center }>
              <TextInputField readOnly={ false } value={ uncommitted.locale } onChange={ this.onChangeLocale } label="Locale" />
            </Row>
          </Column>
          <Column className="right-column">
            <SmallHeader>Bot state settings</SmallHeader>
            <p>Bots use the <a href="https://docs.microsoft.com/en-us/bot-framework/dotnet/bot-builder-dotnet-state" target="_blank">Bot State service</a> to store and retrieve application data. The Bot Framework's bot state service has a size limit of 64 KB. Custom state services may differ.</p>
            <Row align={ RowAlignment.Center }>
              <NumberInputField min={ 0 } value={ uncommitted.stateSizeLimit } onChange={ this.onChangeSizeLimit } label="Size limit (zero for no limit)" />
              <span className="size-limit-suffix">KB</span>
            </Row>
          </Column>
        </Row>
        <Row className="button-row" justify={ RowJustification.Right }>
          <PrimaryButton secondary text="Cancel" onClick={ this.onClickDiscard } />
          <PrimaryButton text="Save" onClick={ this.onClickSave } className="save-button" disabled={ clean } />
        </Row>
      </GenericDocument>
    );
  }
}
