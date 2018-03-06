import React from 'react';
import { css } from 'glamor';
import { debounce } from 'lodash';

import PrimaryButton from '../widget/primaryButton';
import { CommandService } from '../../platform/commands/commandService';
import * as Colors from '../styles/colors';
import * as EditorActions from '../../data/action/editorActions';
import * as Constants from '../../constants';
import store from '../../data/store';
import { getTabGroupForDocument } from '../../data/editorHelpers';

const CSS = css({
  padding: '64px',
  display: 'flex',
  flexFlow: 'column nowrap',
  minWidth: '600px',

  // no margin top on first .two-column-row
  '& > div:first-of-type': {
    marginTop: 0
  },

  '& > .two-column-row': {
    display: 'flex',
    flexFlow: 'row nowrap',
    width: '100%',
    marginTop: '16px',

    '& > *': {
      width: '50%',
      maxWidth: '50%',
      minWidth: '300px'
    },

    '& > *:last-child': {
      marginLeft: '48px'
    }
  },

  '& .horizontal-group': {
    display: 'flex',
    marginTop: '8px',

    '& > input': {
      width: '100%'
    }
  },

  '& .checkbox-container': {
    marginTop: '16px',
    display: 'flex'
  },

  '& input[type="text"]': {
    height: '32px',
    padding: '4px 8px',
    boxSizing: 'border-box',
    width: '100%'
  },

  '& input[type="number"]': {
    height: '32px',
    padding: '4px 8px',
    boxSizing: 'border-box',
    maxWidth: '200px'
  },

  '& input[type="checkbox"]': {
    cursor: 'pointer',
    marginLeft: 0
  },

  '& label': {
    cursor: 'pointer'
  },

  '& span.input-field-label': {
    marginTop: '16px'
  },

  '& .browse-button': {
    marginLeft: '8px'
  },

  '& .button-row': {
    marginTop: '48px',
    display: 'flex',
    justifyContent: 'flex-end',

    '& > .save-button': {
      marginLeft: '8px'
    }
  },

  '& button': {
    width: '120px',
    height: '32px'
  },

  '& p': {
    margin: 0
  },

  '& h2': {
    fontWeight: 200,
    marginTop: 0,
    marginBottom: '5px',
    fontSize: '19px',
    lineHeight: 'normal',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },

  '& a': {
    minWidth: 0,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    textDecoration: 'none',
    color: Colors.APP_HYPERLINK_FOREGROUND_DARK,

    ':hover': {
      color: Colors.APP_HYPERLINK_FOREGROUND_DARK
    }
  },

  '& .size-limit-suffix': {
    display: 'inline-block',
    lineHeight: '32px',
    marginLeft: '8px'
  }
})

export default class AppSettingsEditor extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.onClickBrowse = this.onClickBrowse.bind(this);
    this.onChangeSizeLimit = this.onChangeSizeLimit.bind(this);
    this.onClickSave = this.onClickSave.bind(this);
    this.onChangeNgrokBypass = this.onChangeNgrokBypass.bind(this);
    this.onChangeAuthTokenVersion = this.onChangeAuthTokenVersion.bind(this);
    this.setDirtyFlag = debounce(this.setDirtyFlag, 500);
    this.onClickDiscard = this.onClickDiscard.bind(this);

    this.state = {
      // defaults from /shared/serverSettingsTypes.ts
      ngrokPath: '',
      bypassNgrokLocalhost: true,
      stateSizeLimit: 64,
      use10Tokens: false
    };
  }

  componentWillMount() {
    // load settings from main and populate form
    CommandService.remoteCall('app:settings:load')
      .then(settings => {
        this.setState(prevState => ({ ...prevState, ...settings }));
      })
      .catch(err => console.error('Error while loading app settings: ', err));
  }

  onClickBrowse(e) {
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

  onChangeSizeLimit(e) {
    this.setState(({ stateSizeLimit: e.target.value }));
    this.setDirtyFlag(true);
  }

  onClickSave(e) {
    const settings = {
      ngrokPath: this.state.ngrokPath,
      bypassNgrokLocalhost: this.state.bypassNgrokLocalhost,
      stateSizeLimit: this.state.stateSizeLimit,
      use10Tokens: this.state.use10Tokens
    };

    CommandService.remoteCall('app:settings:save', settings)
      .then(() => {
        this.setDirtyFlag(false);
      })
      .catch(err => console.error('Error while saving app settings: ', err));
  }

  onChangeAuthTokenVersion(e) {
    this.setState(({ use10Tokens: !this.state.use10Tokens }));
    this.setDirtyFlag(true);
  }

  onChangeNgrokBypass(e) {
    this.setState(({ bypassNgrokLocalhost: !this.state.bypassNgrokLocalhost }));
    this.setDirtyFlag(true);
  }

  setDirtyFlag(dirty) {
    store.dispatch(EditorActions.setDirtyFlag(this.props.documentId, dirty));
  }

  onClickDiscard(e) {
    store.dispatch(EditorActions.close(getTabGroupForDocument(this.props.documentId), Constants.DocumentId_AppSettings));
  }

  render() {
    return (
      <div className={ CSS }>
        <div className="two-column-row">
          <h2>Service settings</h2>
          <h2>Bot state settings</h2>
        </div>

        <div className="two-column-row">
          <p><a href="https://ngrok.com/" target="_blank">ngrok</a> is network tunneling software. The Bot Framework Emulator works with ngrok to communicate with bots hosted remotely. Read the <a href="https://github.com/Microsoft/BotFramework-Emulator/wiki/Tunneling-(ngrok)" target="_blank">wiki page</a> to learn more about using ngrok and to download it.</p>
          <p>Bots use the <a href="https://docs.microsoft.com/en-us/bot-framework/dotnet/bot-builder-dotnet-state" target="_blank">Bot State service</a> to store and retrieve application data. The Bot Framework's bot state service has a size limit of 64KB. Custom state services may differ.</p>
        </div>

        <div className="two-column-row">
          <div>
            <span className="input-field-label">Path to ngrok:</span>
            <div className="horizontal-group">
              <input type="text" readOnly value={ this.state.ngrokPath } />
              <PrimaryButton onClick={ this.onClickBrowse } text='Browse' buttonClass='browse-button' />
            </div>

            <div className="checkbox-container">
              <input type="checkbox" checked={ this.state.bypassNgrokLocalhost } onChange={ this.onChangeNgrokBypass } id="ngrok-bypass" />
              <label htmlFor="ngrok-bypass">Bypass ngrok for local addresses</label>
            </div>
            <div className="checkbox-container">
              <input type="checkbox" checked={ this.state.use10Tokens } onChange={ this.onChangeAuthTokenVersion } id="auth-token-version" />
              <label htmlFor="auth-token-version">Use version 1.0 authentication tokens</label>
            </div>
          </div>

          <div>
            <span className="input-field-label">Size limit (zero for no limit)</span>
            <div className="horizontal-group">
              <input type="number" min="0" value={ this.state.stateSizeLimit } onChange={ this.onChangeSizeLimit } /><span className="size-limit-suffix">KB</span>
            </div>
          </div>
        </div>

        <div className="button-row">
          <PrimaryButton text='Discard changes' onClick={ this.onClickDiscard } />
          <PrimaryButton text='Save' onClick={ this.onClickSave } buttonClass='save-button' disabled={ !this.props.dirty } />
        </div>
      </div>
    );
  }
}
