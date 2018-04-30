import { IBotInfo, newEndpoint } from '@bfemulator/app-shared';
import { BotConfigWithPath, IBotConfigWithPath } from '@bfemulator/sdk-shared';
import { Column, MediumHeader, PrimaryButton, Row, TextInputField } from '@bfemulator/ui-react';
import { css } from 'glamor';
import { debounce } from 'lodash';
import { EndpointService } from 'msbot/bin/models';
import { IEndpointService, ServiceType } from 'msbot/bin/schema';
import * as React from 'react';
import { connect } from 'react-redux';
import * as EditorActions from '../../../data/action/editorActions';
import { getBotInfoByPath } from '../../../data/botHelpers';
import store, { IRootState } from '../../../data/store';

import { CommandService } from '../../../platform/commands/commandService';
import { GenericDocument } from '../../layout';

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

interface BotSettingsEditorProps {
  bot?: IBotConfigWithPath;
  dirty?: boolean;
  documentId?: string;
}

interface BotSettingsEditorState {
  bot?: IBotConfigWithPath;
  endpoint?: IEndpointService;
  secret?: string;
}

// TODO: We need to deprecate this function as we move to multiple endpoints
function getFirstBotEndpointOrDefault(bot) {
  return (Array.isArray(bot.services) && bot.services.find(service => service.type === ServiceType.Endpoint) as IEndpointService) || newEndpoint();
}

class BotSettingsEditor extends React.Component<BotSettingsEditorProps, BotSettingsEditorState> {
  constructor(props: BotSettingsEditorProps, context) {
    super(props, context);

    const { bot } = props;
    const botInfo = getBotInfoByPath(bot.path);
    const endpoint = getFirstBotEndpointOrDefault(bot);

    this.state = {
      bot,
      endpoint,
      secret: (botInfo && botInfo.secret) || ''
    };
  }

  componentWillReceiveProps(newProps: BotSettingsEditorProps) {
    const { path: newBotPath } = newProps.bot;
    // handling a new bot
    if (newBotPath !== this.state.bot.path) {
      const newBotInfo: IBotInfo = getBotInfoByPath(newBotPath);

      this.setState({ endpoint: getFirstBotEndpointOrDefault(newProps.bot), secret: newBotInfo.secret });
      this.setDirtyFlag(false);
    }
  }

  private onChangeEndpoint = (e) => {
    const endpoint: IEndpointService = new EndpointService({ ...this.state.endpoint, endpoint: e.target.value, name: e.target.value });
    this.setState({ endpoint });
    this.setDirtyFlag(true);
  };

  private onChangeAppId = (e) => {
    const endpoint: IEndpointService = new EndpointService({ ...this.state.endpoint, appId: e.target.value });
    this.setState({ endpoint });
    this.setDirtyFlag(true);
  };

  private onChangeAppPw = (e) => {
    const endpoint: IEndpointService = new EndpointService({ ...this.state.endpoint, appPassword: e.target.value });
    this.setState({ endpoint });
    this.setDirtyFlag(true);
  };

  private onChangeName = (e) => {
    const bot: IBotConfigWithPath = BotConfigWithPath.fromJSON({ ...this.state.bot, name: e.target.value });
    this.setState({ bot });
    this.setDirtyFlag(true);
  };

  private onChangeSecret = (e) => {
    this.setState({ secret: e.target.value });
    this.setDirtyFlag(true);
  };

  private onSave = async (e, connect = false) => {
    const { appId = '', appPassword = '', endpoint = '', type, name = '', id = '' } = this.state.endpoint;
    const endpointService: IEndpointService = {
      appId: appId.trim(),
      appPassword: appPassword.trim(),
      endpoint: endpoint.trim(),
      type: type,
      name: name.trim(),
      id: id.trim()
    };

    const { name: botName = '', description = '', path } = this.state.bot;
    const bot: IBotConfigWithPath = BotConfigWithPath.fromJSON({
      name: botName.trim(),
      description: description.trim(),
      secretKey: '',
      path: path.trim(),
      services: [endpointService]
    });

    // write the bot secret to bots.json
    let botInfo = getBotInfoByPath(path);

    botInfo.secret = this.state.secret;

    await CommandService.remoteCall('bot:list:patch', path, botInfo);
    await CommandService.remoteCall('bot:save', bot);

    this.setDirtyFlag(false);
    this.setState({ bot });

    connect && CommandService.call('livechat:new', endpointService);
  };

  private onSaveAndConnect = async e => {
    await this.onSave(e, connect);
  };

  private setDirtyFlag(dirty) {
    store.dispatch(EditorActions.setDirtyFlag(this.props.documentId, dirty));
  }

  render() {
    return (
      <GenericDocument style={ CSS }>
        <Column>
          <MediumHeader className="bot-settings-header">Bot Settings</MediumHeader>
          <TextInputField label="Bot name" value={ this.state.bot.name } required={ true } onChange={ this.onChangeName } />
          <TextInputField label="Endpoint URL" value={ this.state.endpoint.endpoint } required={ true } onChange={ this.onChangeEndpoint } />
          <Row className="multiple-input-row">
            <TextInputField label="MSA App Id" value={ this.state.endpoint.appId } onChange={ this.onChangeAppId } />
            <TextInputField label="MSA App Password" value={ this.state.endpoint.appPassword } onChange={ this.onChangeAppPw } type="password" />
          </Row>
          <TextInputField label="Bot secret" value={ this.state.secret } onChange={ this.onChangeSecret } type="password" />
          <Row className="button-row">
            <PrimaryButton text="Save" onClick={ this.onSave } className="save-button" disabled={ !this.props.dirty } />
            <PrimaryButton text="Save & Connect" onClick={ this.onSaveAndConnect } className="save-connect-button" disabled={ !this.props.dirty } />
          </Row>
        </Column>
      </GenericDocument>
    );
  }
}

function mapStateToProps(state: IRootState, ownProps: object): BotSettingsEditorProps {
  return {
    bot: state.bot.activeBot
  };
}

export default connect(mapStateToProps)(BotSettingsEditor);
