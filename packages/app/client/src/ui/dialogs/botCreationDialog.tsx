import * as React from 'react';
import { IBotConfig, IEndpointService } from '@bfemulator/app-shared';
import { css } from 'glamor';
import { uniqueId } from '@bfemulator/sdk-shared';

import * as BotActions from '../../data/action/botActions';
import * as NavBarActions from '../../data/action/navBarActions';
import * as Constants from '../../constants';
import { CommandService } from '../../platform/commands/commandService';
import store from '../../data/store';
import { Fonts, Colors, PrimaryButton, TextInputField, MediumHeader, Row, RowAlignment, RowJustification, Column, Checkbox } from '@bfemulator/ui-react';
import { DialogService } from './service/index';
import { ActiveBotHelper } from '../helpers/activeBotHelper';
import { GenericDocument } from '../layout';

const CSS = css({
  backgroundColor: Colors.EDITOR_TAB_BACKGROUND_DARK,
  padding: '32px',

  '& .multi-input-row > *': {
    marginLeft: '8px'
  },

  '& .multi-input-row > *:first-child': {
    marginLeft: 0
  },

  '& .button-row': {
    marginTop: '48px'
  },

  '& .bot-create-header': {
    marginBottom: '16px'
  },

  '& .secret-checkbox': {
    paddingBottom: '8px'
  }
});

export interface IBotCreationDialogState {
  bot: IBotConfig;
  botDirectory: string;
  endpoint: IEndpointService;
  secret: string;
  secretEnabled: boolean;
  touchedName: boolean;
}

export default class BotCreationDialog extends React.Component<{}, IBotCreationDialogState> {
  constructor(props, context) {
    super(props, context);

    this.state = {
      bot: {
        name: 'My bot',
        description: '',
        services: []
      },
      botDirectory: '',
      endpoint: {
        type: 'endpoint',
        name: 'http://localhost:3978/api/messages',
        id: uniqueId(),
        appId: '',
        appPassword: '',
        endpoint: 'http://localhost:3978/api/messages'
      },
      touchedName: false,
      secret: '',
      secretEnabled: false
    };
  }

  private onChangeEndpoint = (e) => {
    const endpoint = { ...this.state.endpoint, endpoint: e.target.value, name: e.target.value };
    this.setState({ endpoint });
  }

  private onChangeAppId = (e) => {
    const endpoint = { ...this.state.endpoint, appId: e.target.value };
    this.setState({ endpoint });
  }

  private onChangeAppPw = (e) => {
    const endpoint = { ...this.state.endpoint, appPassword: e.target.value };
    this.setState({ endpoint });
  }

  private onChangeName = (e) => {
    const bot = { ...this.state.bot, name: e.target.value };
    this.setState({ bot, touchedName: true });
  }

  private onCancel = (e) => {
    DialogService.hideDialog();
  }

  private onToggleSecret = (e) => {
    this.setState({ secretEnabled: !this.state.secretEnabled, secret: '' });
  }

  private onConnect = (e) => {
    const endpoint: IEndpointService = {
      type: this.state.endpoint.type.trim(),
      name: this.state.endpoint.name.trim(),
      id: this.state.endpoint.id.trim(),
      appId: this.state.endpoint.appId.trim(),
      appPassword: this.state.endpoint.appPassword.trim(),
      endpoint: this.state.endpoint.endpoint.trim()
    };

    const bot: IBotConfig = {
      ...this.state.bot,
      name: this.state.bot.name.trim(),
      description: this.state.bot.description.trim(),
      services: [endpoint]
    };

    const secret = this.state.secretEnabled && this.state.secret ? this.state.secret : null;

    ActiveBotHelper.confirmAndCreateBot(bot, this.state.botDirectory, secret)
      .then(() => DialogService.hideDialog())
      .catch(err => console.error('Error during confirm and create bot.'));
  }

  private onSelectFolder = (e) => {
    const dialogOptions = {
      title: 'Choose a folder for your bot',
      buttonLabel: 'Choose folder',
      properties: ['openDirectory', 'promptToCreate']
    };

    CommandService.remoteCall('shell:showOpenDialog', dialogOptions)
      .then(path => {
        if (path) {
          this.setState({ botDirectory: path });

          // use bot directory as bot name if name hasn't been touched
          if (!this.state.touchedName && path)
            CommandService.remoteCall('path:basename', path)
              .then(dirName => {
                const bot = { ...this.state.bot, name: dirName };
                this.setState({ bot });
              });
        }
      })
      .catch(err => console.log('User cancelled choosing a bot folder: ', err));
  }

  private onChangeSecret = (e) => {
    this.setState({ secret: e.target.value });
  }

  render(): JSX.Element {
    const secretCriteria = this.state.secretEnabled ? this.state.secret : true;

    const requiredFieldsCompleted = this.state.bot
      && this.state.endpoint.endpoint
      && this.state.bot.name
      && this.state.botDirectory
      && secretCriteria;

    return (
      <div { ...CSS }>
        <Column>
          <MediumHeader className="bot-create-header">Add a bot</MediumHeader>
          <TextInputField value={ this.state.endpoint.endpoint } onChange={ this.onChangeEndpoint } label={ 'Endpoint URL' } required={ true } />
          <Row className="multi-input-row">
            <TextInputField value={ this.state.endpoint.appId } onChange={ this.onChangeAppId } label={ 'MSA app ID (optional)' } />
            <TextInputField value={ this.state.endpoint.appPassword } onChange={ this.onChangeAppPw } label={ 'MSA app password (optional)' } type={ 'password' } />
          </Row>
          <Row className="multi-input-row" align={ RowAlignment.Center }>
            <TextInputField value={ this.state.bot.name } onChange={ this.onChangeName } label={ 'Bot name' } required={ true } />
            <TextInputField value={ this.state.botDirectory } label={ 'Project folder' } readOnly={ false } required={ true } />
            <PrimaryButton text='Browse' onClick={ this.onSelectFolder } className="browse-button" />
          </Row>
          <Checkbox className={ 'secret-checkbox' } checked={ this.state.secretEnabled } onChange={ this.onToggleSecret } label={ 'Protect your bot with a secret' } id={ 'bot-secret-checkbox' } />
          { this.state.secretEnabled && <TextInputField value={ this.state.secret } onChange={ this.onChangeSecret } required={ this.state.secretEnabled } type={ 'password' } /> }
          <Row className="multi-input-row button-row" justify={ RowJustification.Right }>
            <PrimaryButton text='Cancel' onClick={ this.onCancel } className="cancel-button" />
            <PrimaryButton text='Connect' onClick={ this.onConnect } disabled={ !requiredFieldsCompleted } className="connect-button" />
          </Row>
        </Column>
      </div>
    );
  }
}
