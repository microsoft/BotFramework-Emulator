import * as React from 'react';
import PropTypes from 'prop-types';
import { css } from 'glamor';
import { debounce } from 'lodash';
import { connect } from 'react-redux';
import { getBotDisplayName, getFirstBotEndpoint, newEndpoint, getBotId, IBotInfo } from '@bfemulator/app-shared';
import { IBotConfig, IEndpointService, ServiceType } from '@bfemulator/sdk-shared';
import { Fonts, Column, Row, RowAlignment, PrimaryButton, TextInputField, MediumHeader } from '@bfemulator/ui-react';

import { CommandService } from '../../../platform/commands/commandService';
import * as BotActions from '../../../data/action/botActions';
import * as ChatActions from '../../../data/action/chatActions';
import * as EditorActions from '../../../data/action/editorActions';
import store, { IRootState } from '../../../data/store';
import { GenericDocument } from '../../layout';
import { getBotInfoById } from '../../../data/botHelpers';

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
  bot?: IBotConfig;
  dirty?: boolean;
  documentId?: string;
}

interface IBotSettingsEditorState {
  bot?: IBotConfig;
  endpoint?: IEndpointService;
  secret?: string;
}

class BotSettingsEditor extends React.Component<IBotSettingsEditorProps, IBotSettingsEditorState> {
  constructor(props: IBotSettingsEditorProps, context) {
    super(props, context);

    this.state = {
      bot: this.props.bot,
      endpoint: getFirstBotEndpoint(this.props.bot) || newEndpoint(),
      secret: this.props.bot ? getBotInfoById(getBotId(this.props.bot)).secret : ''
    };
  }

  componentWillReceiveProps(newProps) {
    const { bot: newBot }: { bot: IBotConfig } = newProps;
    // handling a new bot
    const newBotId = getBotId(newBot);
    if (newBotId !== getBotId(this.state.bot)) {
      const newBotInfo: IBotInfo = getBotInfoById(newBotId);
      this.setState({ endpoint: getFirstBotEndpoint(newBot) || newEndpoint(), secret: newBotInfo.secret });
      this.setDirtyFlag(false);
    }
  }

  private onChangeEndpoint = (e) => {
    const endpoint: IEndpointService = { ...this.state.endpoint, endpoint: e.target.value, name: e.target.value };
    this.setState({ endpoint });
    this.setDirtyFlag(true);
  }

  private onChangeAppId = (e) => {
    const endpoint: IEndpointService = { ...this.state.endpoint, appId: e.target.value };
    this.setState({ endpoint });
    this.setDirtyFlag(true);
  }

  private onChangeAppPw = (e) => {
    const endpoint: IEndpointService = { ...this.state.endpoint, appPassword: e.target.value };
    this.setState({ endpoint });
    this.setDirtyFlag(true);
  }

  private onChangeName = (e) => {
    const bot: IBotConfig = { ...this.state.bot, name: e.target.value };
    this.setState({ bot });
    this.setDirtyFlag(true);
  }

  private onChangeSecret = (e) => {
    this.setState({ secret: e.target.value });
    this.setDirtyFlag(true);
  }

  private onSave = (e) => {
    const { appId, appPassword, endpoint, type, name, id } = this.state.endpoint;
    const endpointService: IEndpointService = {
      appId: appId.trim(),
      appPassword: appPassword.trim(),
      endpoint: endpoint.trim(),
      type: type.trim(),
      name: name.trim(),
      id: id.trim()
    };

    const { name: botName, description } = this.state.bot;
    const bot: IBotConfig = {
      name: botName.trim(),
      description: description.trim(),
      services: [endpointService]
    };

    return CommandService.remoteCall('bot:save', bot, this.state.secret)
      .then(() => {
        store.dispatch(BotActions.patch(bot, this.state.secret));
        this.setDirtyFlag(false);
        this.setState({ bot });
        CommandService.remoteCall('electron:set-title-bar', getBotDisplayName(bot));
      });
  }

  private onSaveAndConnect = (e) => {
    this.onSave(e)
      .then(() => {
        CommandService.call('livechat:new');
      });
  }

  private setDirtyFlag(dirty) {
    store.dispatch(EditorActions.setDirtyFlag(this.props.documentId, dirty));
  }

  render() {
    const botLabel = getBotDisplayName(this.state.bot);

    return (
      <GenericDocument style={ CSS }>
        <Column>
          <MediumHeader className="bot-settings-header">Bot Settings</MediumHeader>
          <TextInputField label='Bot name' value={ this.state.bot.name } required={ true } onChange={ this.onChangeName } />
          <TextInputField label='Endpoint URL' value={ this.state.endpoint.endpoint } required={ true } onChange={ this.onChangeEndpoint } />
          <Row className="multiple-input-row">
            <TextInputField label='MSA App Id' value={ this.state.endpoint.appId } onChange={ this.onChangeAppId } />
            <TextInputField label='MSA App Password' value={ this.state.endpoint.appPassword } onChange={ this.onChangeAppPw } type={ 'password' } />
          </Row>
          <TextInputField label='Bot secret' value={ this.state.secret } onChange={ this.onChangeSecret } type={ 'password' } />
          <Row className="button-row">
            <PrimaryButton text="Save" onClick={ this.onSave } className='save-button' disabled={ !this.props.dirty } />
            <PrimaryButton text="Save & Connect" onClick={ this.onSaveAndConnect } className='save-connect-button' disabled={ !this.props.dirty } />
          </Row>
        </Column>
      </GenericDocument>
    );
  }
}

function mapStateToProps(state: IRootState, ownProps: object) : IBotSettingsEditorProps {
  return {
    bot:  state.bot.activeBot
  };
}

export default connect(mapStateToProps)(BotSettingsEditor);
