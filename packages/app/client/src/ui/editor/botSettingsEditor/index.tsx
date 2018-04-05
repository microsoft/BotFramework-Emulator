import * as React from 'react';
import PropTypes from 'prop-types';
import { css } from 'glamor';
import { debounce } from 'lodash';
import { connect } from 'react-redux';
import { getBotDisplayName, IBot } from '@bfemulator/app-shared';

import { CommandService } from '../../../platform/commands/commandService';
import * as Fonts from '../../styles/fonts';
import * as BotActions from '../../../data/action/botActions';
import * as ChatActions from '../../../data/action/chatActions';
import * as EditorActions from '../../../data/action/editorActions';
import store from '../../../data/store';

import { PrimaryButton, TextInputField, MediumHeader } from '../../widget';
import { Column, Row, RowAlignment, GenericDocument } from '../../layout';

const CSS = css({
  '& .bot-settings-header': {
    marginBottom: '16px'
  },

  '& .browse-path-button': {
    marginLeft: '8px',
    alignSelf: 'center'
  },

  '& .save-button': {
    marginLeft: 'auto'
  },

  '& .save-connect-button': {
    marginLeft: '8px'
  },

  '& .multiple-input-row': {
    '& > div': {
      marginLeft: '8px'
    },

    '& > div:first-child': {
      marginLeft: 0
    }
  },

  '& .button-row': {
    marginTop: '48px'
  },

  '& .locale-input': {
    flexShrink: 2,
    minWidth: '100px'
  }
});

interface IBotSettingsEditorProps {
  bot?: IBot;
  dirty?: boolean;
  documentId?: string;
}

interface IBotSettingsEditorState {
  bot?: IBot;
}

class BotSettingsEditor extends React.Component<IBotSettingsEditorProps, IBotSettingsEditorState> {
  constructor(props: IBotSettingsEditorProps, context) {
    super(props, context);

    this.onChangeBotId = this.onChangeBotId.bind(this);
    this.onChangeEndpoint = this.onChangeEndpoint.bind(this);
    this.onChangeAppId = this.onChangeAppId.bind(this);
    this.onChangeAppPw = this.onChangeAppPw.bind(this);
    this.onChangeLocale = this.onChangeLocale.bind(this);
    this.onChangeName = this.onChangeName.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onSaveAndConnect = this.onSaveAndConnect.bind(this);
    this.setDirtyFlag = debounce(this.setDirtyFlag, 500);

    this.state = {
      bot: this.props.bot
    };
  }

  componentWillReceiveProps(newProps) {
    const { bot: newBot } = newProps;
    // handling a new bot
    if (newBot.id !== this.state.bot.id) {
      this.setDirtyFlag(false);
    }
  }

  onChangeBotId(e) {
    const bot = { ...this.state.bot, botId: e.target.value };
    this.setState({ bot });
    this.setDirtyFlag(true);
  }

  onChangeEndpoint(e) {
    const bot = { ...this.state.bot, botUrl: e.target.value };
    this.setState({ bot });
    this.setDirtyFlag(true);
  }

  onChangeAppId(e) {
    const bot = { ...this.state.bot, msaAppId: e.target.value };
    this.setState({ bot });
    this.setDirtyFlag(true);
  }

  onChangeAppPw(e) {
    const bot = { ...this.state.bot, msaPassword: e.target.value };
    this.setState({ bot });
    this.setDirtyFlag(true);
  }

  onChangeLocale(e) {
    const bot = { ...this.state.bot, locale: e.target.value };
    this.setState({ bot });
    this.setDirtyFlag(true);
  }

  onChangeName(e) {
    const bot = { ...this.state.bot, botName: e.target.value };
    this.setState({ bot });
    this.setDirtyFlag(true);
  }

  onSave(e) {
    const bot = {
      ...this.state.bot,
      botId: this.state.bot.botId.trim(),
      botUrl: this.state.bot.botUrl.trim(),
      msaAppId: this.state.bot.msaAppId.trim(),
      msaPassword: this.state.bot.msaPassword.trim(),
      locale: this.state.bot.locale.trim(),
      botName: this.state.bot.botName.trim()
    };

    return CommandService.remoteCall('bot:save', bot)
      .then(() => {
        store.dispatch(BotActions.patch(bot));
        this.setDirtyFlag(false);
        this.setState({ bot: bot });
        CommandService.remoteCall('electron:set-title-bar', getBotDisplayName(bot));
      });
  }

  onSaveAndConnect(e) {
    this.onSave(e)
      .then(() => {
        CommandService.call('livechat:new');
      })
  }

  setDirtyFlag(dirty) {
    store.dispatch(EditorActions.setDirtyFlag(this.props.documentId, dirty));
  }

  render() {
    const botLabel = getBotDisplayName(this.state.bot);

    return (
      <GenericDocument style={ CSS }>
        <Column>
          <MediumHeader className="bot-settings-header">Bot Settings</MediumHeader>
          <TextInputField label='Bot name' value={ this.state.bot.botName } required={ true } onChange={ this.onChangeName } />
          <TextInputField label='Endpoint URL' value={ this.state.bot.botUrl } required={ true } onChange={ this.onChangeEndpoint } />
          <Row className="multiple-input-row">
            <TextInputField label='MSA App Id' value={ this.state.bot.msaAppId } onChange={ this.onChangeAppId } />
            <TextInputField label='MSA App Password' value={ this.state.bot.msaPassword } onChange={ this.onChangeAppPw } />
            <TextInputField className="locale-input" label='Locale' value={ this.state.bot.locale } onChange={ this.onChangeLocale } />
          </Row>
          <Row className="button-row">
            <PrimaryButton text="Save" onClick={ this.onSave } className='save-button' disabled={ !this.props.dirty } />
            <PrimaryButton text="Save & Connect" onClick={ this.onSaveAndConnect } className='save-connect-button' disabled={ !this.props.dirty } />
          </Row>
        </Column>
      </GenericDocument>
    );
  }
}

export default connect((state, ownProps) => ({
  bot: state.bot.activeBot
}))(BotSettingsEditor);
