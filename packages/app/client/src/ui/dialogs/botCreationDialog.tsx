import { uniqueId } from '@bfemulator/sdk-shared';
import { Checkbox, Colors, Column, MediumHeader, PrimaryButton, Row, RowAlignment, RowJustification, TextInputField } from '@bfemulator/ui-react';
import { css } from 'glamor';
import {EndpointService} from 'msbot/bin/models';
import { IEndpointService, ServiceType } from 'msbot/bin/schema';
import * as React from 'react';
import { BotConfigWithPath } from '@bfemulator/sdk-shared';
import { IBotConfigWithPath } from '@bfemulator/sdk-shared';

import { CommandService } from '../../platform/commands/commandService';
import { ActiveBotHelper } from '../helpers/activeBotHelper';
import { DialogService } from './service';

const CSS = css({
  backgroundColor: Colors.DIALOG_BACKGROUND_DARK,
  padding: '32px',
  width: '648px',

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
    color: Colors.DIALOG_FOREGROUND_DARK,
    marginBottom: '16px'
  },

  '& .secret-checkbox': {
    paddingBottom: '8px',
    color: Colors.DIALOG_FOREGROUND_DARK
  },

  '& .bot-creation-input': {
    border: `solid 1px ${Colors.DIALOG_INPUT_BORDER_DARK}`
  },

  '& .text-input-label, & input': {
    color: Colors.INPUT_TEXT_DARK
  },

  '& input::placeholder': {
    color: Colors.INPUT_PLACEHOLDER_TEXT_DARK
  },

  '& .bot-creation-cta': {
    minWidth: 0,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    textDecoration: 'none',
    color: Colors.APP_HYPERLINK_FOREGROUND_DARK,
    flexShrink: 0,

    ':hover': {
      color: Colors.APP_HYPERLINK_FOREGROUND_DARK
    }
  },

  '& .small-input': {
    width: '200px',
    flexShrink: 0
  },

  '& .secret-row': {
    paddingLeft: '24px',

    '& > .secret-input': {
      width: '176px'  // 200 - 24px
    }
  }
});

export interface BotCreationDialogState {
  bot: IBotConfigWithPath;
  endpoint: IEndpointService;
  secret: string;
  secretEnabled: boolean;
  secretsMatch: boolean;
  secretConfirmation: string;
}

export default class BotCreationDialog extends React.Component<{}, BotCreationDialogState> {
  constructor(props, context) {
    super(props, context);

    this.state = {
      bot: BotConfigWithPath.fromJSON({
        name: '',
        description: '',
        secretKey: '',
        services: [],
        path: ''
      }),
      endpoint: new EndpointService({
        type: ServiceType.Endpoint,
        name: '',
        id: uniqueId(),
        appId: '',
        appPassword: '',
        endpoint: ''
      }),
      secret: '',
      secretEnabled: false,
      secretsMatch: false,
      secretConfirmation: ''
    };
  }

  private onChangeEndpoint = (e) => {
    const endpoint = { ...this.state.endpoint, endpoint: e.target.value, name: e.target.value };
    this.setState({ endpoint });
  };

  private onChangeAppId = (e) => {
    const endpoint = { ...this.state.endpoint, appId: e.target.value };
    this.setState({ endpoint });
  };

  private onChangeAppPw = (e) => {
    const endpoint = { ...this.state.endpoint, appPassword: e.target.value };
    this.setState({ endpoint });
  };

  private onChangeName = (e) => {
    const bot = { ...this.state.bot, name: e.target.value };
    this.setState({ bot });
  };

  private onChangeBotLocation = (e) => {
    const bot = { ...this.state.bot, path: e.target.value };
    this.setState({ bot });
  };

  private onCancel = (e) => {
    DialogService.hideDialog();
  };

  private onToggleSecret = (e) => {
    this.setState({ secretEnabled: !this.state.secretEnabled, secret: '' });
  };

  private onConnect = (e) => {
    const endpoint: IEndpointService = {
      type: this.state.endpoint.type,
      name: this.state.endpoint.name.trim(),
      id: this.state.endpoint.id.trim(),
      appId: this.state.endpoint.appId.trim(),
      appPassword: this.state.endpoint.appPassword.trim(),
      endpoint: this.state.endpoint.endpoint.trim()
    };

    const bot: IBotConfigWithPath = BotConfigWithPath.fromJSON({
      ...this.state.bot,
      name: this.state.bot.name.trim(),
      description: this.state.bot.description.trim(),
      services: [endpoint]
    });

    const secret = this.state.secretEnabled && this.state.secret ? this.state.secret : null;

    ActiveBotHelper.confirmAndCreateBot(bot, secret)
      .then(() => DialogService.hideDialog())
      .catch(err => console.error('Error during confirm and create bot.'));
  };

  private onSelectFolder = (e) => {
    const dialogOptions = {
      filters: [
        {
          name: "Bot Files",
          extensions: ['bot']
        }
      ],
      defaultPath: '',
      showsTagField: false,
      title: "Save as",
      buttonLabel: "Save"
    };

    CommandService.remoteCall('shell:showSaveDialog', dialogOptions)
      .then(path => {
        if (path) {
          const bot = { ...this.state.bot, path };
          this.setState({ bot });
        }
      })
      .catch(err => console.log('User cancelled choosing a bot folder: ', err));
  };

  private onChangeSecret = (e) => {
    this.setState({ secret: e.target.value, secretsMatch: e.target.value === this.state.secretConfirmation });
  };

  private onChangeSecretConfirmation = (e) => {
    this.setState({ secretConfirmation: e.target.value, secretsMatch: e.target.value === this.state.secret });
  };

  render(): JSX.Element {
    const secretCriteria = this.state.secretEnabled ? this.state.secret && this.state.secretsMatch : true;

    const requiredFieldsCompleted = this.state.bot
      && this.state.endpoint.endpoint
      && this.state.bot.name
      && this.state.bot.path
      && secretCriteria;

    return (
      <div { ...CSS }>
        <Column>
          <MediumHeader className="bot-create-header">Add a bot</MediumHeader>
          <Row className="multi-input-row" align={ RowAlignment.Center }>
            <TextInputField className="small-input" inputClass="bot-creation-input" value={ this.state.bot.name } onChange={ this.onChangeName } label={ 'Bot name' } required={ true } />
            <TextInputField inputClass="bot-creation-input" value={ this.state.bot.path } onChange={ this.onChangeBotLocation }
              label={ 'Location' } placeholder={ 'Choose a location for your bot configuration' } readOnly={ false } required={ true } />
            <a className="bot-creation-cta" href="javascript:void(0)" onClick={ this.onSelectFolder }>Browse...</a>
          </Row>
          <TextInputField inputClass="bot-creation-input" value={ this.state.endpoint.endpoint } onChange={ this.onChangeEndpoint }
            placeholder={ 'Enter a URL for your locally running bot' } label={ 'Endpoint URL' } required={ true } />
          <Row className="multi-input-row">
            <TextInputField className="small-input" inputClass="bot-creation-input" value={ this.state.endpoint.appId } onChange={ this.onChangeAppId } label={ 'MSA app ID' } placeholder={ 'Optional' } />
            <TextInputField className="small-input" inputClass="bot-creation-input" value={ this.state.endpoint.appPassword } onChange={ this.onChangeAppPw }
              label={ 'MSA app password' } placeholder={ 'Optional' } type={ 'password' } />
          </Row>
          <Checkbox className={ 'secret-checkbox' } checked={ this.state.secretEnabled } onChange={ this.onToggleSecret } label={ 'Encrypt your keys' } id={ 'bot-secret-checkbox' } />
          {
            this.state.secretEnabled &&
            <Row className="multi-input-row secret-row">
              <TextInputField className="secret-input" inputClass="bot-creation-input" value={ this.state.secret } onChange={ this.onChangeSecret }
                required={ this.state.secretEnabled } label={ 'Create a secret' } type={ 'password' } />
              <TextInputField className="secret-input secret-confirmation" inputClass="bot-creation-input" value={ this.state.secretConfirmation } onChange={ this.onChangeSecretConfirmation }
                required={ this.state.secretEnabled } label={ 'Confirm your secret' } type={ 'password' } error={ this.state.secret && !this.state.secretsMatch ? 'Secrets do not match' : null } />
            </Row>
          }
          <Row className="multi-input-row button-row" justify={ RowJustification.Right }>
            <PrimaryButton secondary text='Cancel' onClick={ this.onCancel } className="cancel-button" />
            <PrimaryButton text='Connect' onClick={ this.onConnect } disabled={ !requiredFieldsCompleted } className="connect-button" />
          </Row>
        </Column>
      </div>
    );
  }
}
