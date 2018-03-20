import * as React from 'react';
import { css } from 'glamor';
import { debounce } from 'lodash';

import { IFrameworkSettings } from '@bfemulator/app-shared';
import { CommandService } from '../../platform/commands/commandService';
import * as Colors from '../styles/colors';
import * as EditorActions from '../../data/action/editorActions';
import * as Constants from '../../constants';
import store from '../../data/store';
import { getTabGroupForDocument } from '../../data/editorHelpers';
import { Column, ColumnAlignment, GenericDocument, Row, RowAlignment, RowJustification, TruncateText } from '../layout';
import { Checkbox, NumberInputField, TextInputField, PrimaryButton } from '../widget';

const CSS = css({
  '& h2': {
    fontWeight: 200,
    fontSize: '20px'
  },

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

export default class AppSettingsEditor extends React.Component<IAppSettingsEditorProps, IFrameworkSettings> {
  constructor(props: IAppSettingsEditorProps, context: any) {
    super(props, context);

    this.onClickBrowse = this.onClickBrowse.bind(this);
    this.onChangeSizeLimit = this.onChangeSizeLimit.bind(this);
    this.onClickSave = this.onClickSave.bind(this);
    this.onChangeNgrokBypass = this.onChangeNgrokBypass.bind(this);
    this.onChangeAuthTokenVersion = this.onChangeAuthTokenVersion.bind(this);
    this.setDirtyFlag = debounce(this.setDirtyFlag, 500);
    this.onClickDiscard = this.onClickDiscard.bind(this);

    this.state = {
      ngrokPath: '',
      bypassNgrokLocalhost: true,
      stateSizeLimit: 64,
      use10Tokens: false
    };
  }

  componentWillMount(): void {
    // load settings from main and populate form
    CommandService.remoteCall('app:settings:load')
      .then(settings => {
        this.setState(prevState => ({ ...prevState, ...settings }));
      })
      .catch(err => console.error('Error while loading app settings: ', err));
  }

  onClickBrowse(e): void {
    const dialogOptions = {
      title: 'Browse for ngrok',
      buttonLabel: 'Select ngrok',
      properties: ['openFile']
    };

    CommandService.remoteCall('shell:showOpenDialog', dialogOptions)
      .then(path => {
        this.setState(({ ngrokPath: path }));
        this.setDirtyFlag(true);
      })
      .catch(err => console.log('User cancelled browsing for ngrok: ', err));
  }

  onChangeSizeLimit(e): void {
    this.setState(({ stateSizeLimit: e.target.value }));
    this.setDirtyFlag(true);
  }

  onClickSave(e): void {
    const settings: IFrameworkSettings = {
      ngrokPath: this.state.ngrokPath.trim(),
      bypassNgrokLocalhost: this.state.bypassNgrokLocalhost,
      stateSizeLimit: +this.state.stateSizeLimit.trim(),
      use10Tokens: this.state.use10Tokens
    };

    CommandService.remoteCall('app:settings:save', settings)
      .then(() => {
        this.setDirtyFlag(false);
      })
      .catch(err => console.error('Error while saving app settings: ', err));
  }

  onChangeAuthTokenVersion(e): void {
    this.setState(({ use10Tokens: !this.state.use10Tokens }));
    this.setDirtyFlag(true);
  }

  onChangeNgrokBypass(e): void {
    this.setState(({ bypassNgrokLocalhost: !this.state.bypassNgrokLocalhost }));
    this.setDirtyFlag(true);
  }

  setDirtyFlag(dirty): void {
    store.dispatch(EditorActions.setDirtyFlag(this.props.documentId, dirty));
  }

  onClickDiscard(e): void {
    store.dispatch(EditorActions.close(getTabGroupForDocument(this.props.documentId), Constants.DocumentId_AppSettings));
  }

  render(): JSX.Element {
    return (
      <GenericDocument style={ CSS }>
        <Row>
          <Column>
            <h2><TruncateText>Service settings</TruncateText></h2>
            <p><a href="https://ngrok.com/" target="_blank">ngrok</a> is network tunneling software. The Bot Framework Emulator works with ngrok to communicate with bots hosted remotely. Read the <a href="https://github.com/Microsoft/BotFramework-Emulator/wiki/Tunneling-(ngrok)" target="_blank">wiki page</a> to learn more about using ngrok and to download it.</p>
            <Row align={ RowAlignment.Center }>
              <TextInputField readOnly={ true } value={ this.state.ngrokPath } label={ 'Path to ngrok' } />
              <PrimaryButton onClick={ this.onClickBrowse } text={ 'Browse' } className="browse-button" />
            </Row>
            <Checkbox checked={ this.state.bypassNgrokLocalhost } onChange={ this.onChangeNgrokBypass } id={ 'ngrok-bypass' } label={ 'Bypass ngrok for local addresses' } />
            <Checkbox checked={ this.state.use10Tokens } onChange={ this.onChangeAuthTokenVersion } id={ 'auth-token-version' } label={ 'Use version 1.0 authentication tokens' } />
          </Column>
          <Column className="right-column">
            <h2><TruncateText>Bot state settings</TruncateText></h2>
            <p>Bots use the <a href="https://docs.microsoft.com/en-us/bot-framework/dotnet/bot-builder-dotnet-state" target="_blank">Bot State service</a> to store and retrieve application data. The Bot Framework's bot state service has a size limit of 64KB. Custom state services may differ.</p>
            <Row align={ RowAlignment.Center }>
              <NumberInputField min={ 0 } value={ this.state.stateSizeLimit } onChange={ this.onChangeSizeLimit} label={ 'Size limit (zero for no limit)' } />
              <span className="size-limit-suffix">KB</span>
            </Row>
          </Column>
        </Row>
        <Row className="button-row" justify={ RowJustification.Right }>
          <PrimaryButton text='Discard changes' onClick={ this.onClickDiscard } disabled={ !this.props.dirty } />
          <PrimaryButton text='Save' onClick={ this.onClickSave } className="save-button" disabled={ !this.props.dirty } />
        </Row>
      </GenericDocument>
    );
  }
}
