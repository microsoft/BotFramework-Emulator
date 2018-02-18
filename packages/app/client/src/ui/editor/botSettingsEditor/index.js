import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'glamor';

import { CommandService } from '../../../platform/commands/commandService';
import * as Fonts from '../../styles/fonts';

const CSS = css({
  boxSizing: 'border-box',
  padding: '32px',
  display: 'flex',
  flexFlow: 'column nowrap',
  fontFamily: Fonts.FONT_FAMILY_DEFAULT,
  boxSizing: 'border-box',

  '& > input': {
    marginTop: '16px',
    height: '32px',
    padding: '4px 8px',
    boxSizing: 'border-box'
  },

  '& > input:first-child': {
    marginTop: 0
  },

  '& > span': {
    marginTop: '16px'
  },

  '& > span:first-child': {
    marginTop: 0
  },

  '& > button': {
    marginTop: '32px',
    width: '120px'
  }
});

export default class SettingsEditor extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.onChangeHandle = this.onChangeHandle.bind(this);
    this.onChangeEndpoint = this.onChangeEndpoint.bind(this);
    this.onChangeAppId = this.onChangeAppId.bind(this);
    this.onChangeAppPw = this.onChangeAppPw.bind(this);
    this.onChangeLocale = this.onChangeLocale.bind(this);
    this.onSave = this.onSave.bind(this);

    this.state = {
      originalHandle: this.props.bot.handle,
      handle: this.props.bot.handle,
      endpoint: this.props.bot.settings.endpoint,
      msaAppId: this.props.bot.settings.msaAppId,
      msaAppPw: this.props.bot.settings.msaAppPw,
      locale: this.props.bot.settings.locale
    };
  }

  componentWillReceiveProps(newProps) {
    // If opening two bot settings tabs back-to-back, the component will not re-intialize,
    // so we need to detect if a new bot's settings should be displayed
    if (newProps.bot.handle !== this.state.handle) {
      this.setState(({
        originalHandle: newProps.bot.handle,
        handle: newProps.bot.handle,
        endpoint: newProps.bot.settings.endpoint,
        msaAppId: newProps.bot.settings.msaAppId,
        msaAppPw: newProps.bot.settings.msaAppPw,
        locale: newProps.bot.settings.locale
      }));
    }
  }

  onChangeHandle(e) {
    this.setState(({ handle: e.target.value }));
  }

  onChangeEndpoint(e) {
    this.setState(({ endpoint: e.target.value }));
  }

  onChangeAppId(e) {
    this.setState(({ msaAppId: e.target.value }));
  }

  onChangeAppPw(e) {
    this.setState(({ msaAppPw: e.target.value }));
  }
  
  onChangeLocale(e) {
    this.setState(({ locale: e.target.value }));
  }

  onSave(e) {
    // write new settings to bot file
    const newBotFile = {
      ...this.props.bot,
      handle: this.state.handle,
      settings: {
        endpoint: this.state.endpoint,
        msaAppId: this.state.msaAppId,
        msaAppPw: this.state.msaAppPw,
        locale: this.state.locale
      }
    };
    CommandService.remoteCall('bot:save', newBotFile, this.state.originalHandle);
  }

  render() {
    return (
      <div className={ CSS }>
        <h1>Bot Settings for { this.props.bot.handle }</h1>

        <span>Bot handle</span>
        <input value={ this.state.handle } onChange={ this.onChangeHandle } type="text" />

        <span>Endpoint</span>
        <input value={ this.state.endpoint } onChange={ this.onChangeEndpoint } type="text" />

        <span>MSA App Id</span>
        <input value={ this.state.msaAppId } onChange={ this.onChangeAppId } type="text" />

        <span>MSA App Password</span>
        <input value={ this.state.msaAppPw } onChange={ this.onChangeAppPw } type="password" />

        <span>Locale</span>
        <input value={ this.state.locale } onChange={ this.onChangeLocale } type="text" />

        <button onClick={ this.onSave }>Save</button>
      </div>
    );
  }
}

SettingsEditor.propTypes = {
  bot: PropTypes.object.isRequired
};
