import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'glamor';

import { CommandService } from '../../../platform/commands/commandService';
import * as Fonts from '../../styles/fonts';
import * as BotActions from '../../../data/action/botActions';
import store from "../../../data/store";
import { getBotById } from "../../../data/botHelpers";

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
      originalHandle: this.props.botId,
      bot: getBotById(this.props.botId)
    };
  }

  componentWillMount() {
    this.setState({
      originalHandle: this.props.botId,
      bot: getBotById(this.props.botId)
    });
  }

  onChangeHandle(e) {
    const bot = { ...this.state.bot, botId: e.target.value };
    this.setState({ bot });
  }

  onChangeEndpoint(e) {
    const bot = { ...this.state.bot, botUrl: e.target.value };
    this.setState({ bot });
  }

  onChangeAppId(e) {
    const bot = { ...this.state.bot, msaAppId: e.target.value };
    this.setState({ bot });
  }

  onChangeAppPw(e) {
    const bot = { ...this.state.bot, msaPassword: e.target.value };
    this.setState({ bot });
  }

  onChangeLocale(e) {
    const bot = { ...this.state.bot, locale: e.target.value };
    this.setState({ bot });
  }

  onSave(e) {
    // write new settings to bot file
    const newBotFile = {
      ...this.state.bot
    };
    CommandService.remoteCall('bot:save', newBotFile, this.state.originalHandle)
      .then(() => {
        store.dispatch(BotActions.patch(this.state.originalHandle, newBotFile))
        this.setState({ originalHandle: newBotFile.botId });
      });
  }

  render() {
    return (
      <div className={ CSS }>
        <h1>Bot Settings for { this.state.bot.botId }</h1>

        <span>Bot handle</span>
        <input value={ this.state.bot.botId } onChange={ this.onChangeHandle } type="text" />

        <span>Endpoint</span>
        <input value={ this.state.bot.botUrl } onChange={ this.onChangeEndpoint } type="text" />

        <span>MSA App Id</span>
        <input value={ this.state.bot.msaAppId } onChange={ this.onChangeAppId } type="text" />

        <span>MSA App Password</span>
        <input value={ this.state.bot.msaPassword } onChange={ this.onChangeAppPw } type="password" />

        <span>Locale</span>
        <input value={ this.state.bot.locale } onChange={ this.onChangeLocale } type="text" />

        <button onClick={ this.onSave }>Save</button>
      </div>
    );
  }
}

SettingsEditor.propTypes = {
  botId: PropTypes.string.isRequired
};
