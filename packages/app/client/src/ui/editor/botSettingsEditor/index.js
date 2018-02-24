import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'glamor';

import { CommandService } from '../../../platform/commands/commandService';
import * as Fonts from '../../styles/fonts';
import * as BotActions from '../../../data/action/botActions';
import store from '../../../data/store';
import { getBotById } from '../../../data/botHelpers';
import PrimaryButton from '../../shell/explorer/botExplorer/primaryButton';
import { getBotDisplayName } from 'botframework-emulator-shared';

const CSS = css({
  boxSizing: 'border-box',
  padding: '32px',
  display: 'flex',
  flexFlow: 'column nowrap',
  fontFamily: Fonts.FONT_FAMILY_DEFAULT,
  boxSizing: 'border-box',

  '& input': {
    marginTop: '16px',
    height: '32px',
    padding: '4px 8px',
    boxSizing: 'border-box',
    width: '100%'
  },

  '& span': {
    marginTop: '16px'
  },

  '& button': {
    width: '120px',
    height: '32px',
  },

  '& .browse-path-button': {
    marginLeft: '8px',
    alignSelf: 'flex-end',
  },

  '& .save-button': {
    marginTop: '48px',
  },

  '& .horz-group': {
    display: 'flex'
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
    this.onChangeName = this.onChangeName.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onSelectFolder = this.onSelectFolder.bind(this);

    this.state = {
      originalHandle: this.props.botId,
      bot: getBotById(this.props.botId)
    };
  }

  componentWillReceiveProps(newProps) {
    const { botId: newBotId } = newProps;
    if (newBotId !== this.props.botId) {
      this.setState({
        originalHandle: newBotId,
        bot: getBotById(newBotId)
      });
    }
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

  onChangeName(e) {
    const bot = { ...this.state.bot, botName: e.target.value };
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

  onSelectFolder(e) {
    CommandService.remoteCall('bot:settings:chooseFolder')
      .then(path => {
        const bot = { ...this.state.bot, path: path };
        this.setState({ bot });
      })
      .catch(err => console.log('User cancelled choosing a bot folder: ', err));
  }

  render() {
    const botIdentifier = getBotDisplayName(this.state.bot);

    return (
      <div className={ CSS }>
        <h1>Settings for { botIdentifier }</h1>

        <span>Bot name</span>
        <input value={ this.state.bot.botName } onChange={ this.onChangeName } type="text" />

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

        <span>Local folder</span>
        <div className='horz-group'>
          <input value={ this.state.bot.path } type="text" placeholder="Folder containing your bot project" readOnly />
          <PrimaryButton text='Browse' onClick={ this.onSelectFolder } buttonClass='browse-path-button' />
        </div>

        <PrimaryButton text='Save' onClick={ this.onSave } buttonClass='save-button' />
      </div>
    );
  }
}

SettingsEditor.propTypes = {
  botId: PropTypes.string.isRequired
};
