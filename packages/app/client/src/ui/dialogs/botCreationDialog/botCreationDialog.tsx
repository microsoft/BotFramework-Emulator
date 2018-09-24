//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import { BotConfigWithPath, BotConfigWithPathImpl, uniqueId } from '@bfemulator/sdk-shared';
import {
  Checkbox,
  DefaultButton,
  Dialog,
  DialogContent,
  DialogFooter,
  PrimaryButton,
  Row,
  TextField,
  RowAlignment,
} from '@bfemulator/ui-react';
import { EndpointService } from 'botframework-config/lib/models';
import { IEndpointService, ServiceTypes } from 'botframework-config/lib/schema';
import * as React from 'react';
import * as styles from './botCreationDialog.scss';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';
import { ActiveBotHelper } from '../../helpers/activeBotHelper';
import { DialogService } from '../service';
import { SharedConstants, newNotification } from '@bfemulator/app-shared';
import { store } from '../../../data/store';
import { beginAdd } from '../../../data/action/notificationActions';
import { generateBotSecret } from '../../../utils';

export interface BotCreationDialogState {
  bot: BotConfigWithPath;
  endpoint: IEndpointService;
  secret: string;
  encryptKey: boolean;
  revealSecret: boolean;
}

export class BotCreationDialog extends React.Component<{}, BotCreationDialogState> {
  constructor(props: {}, context: BotCreationDialogState) {
    super(props, context);

    this.state = {
      bot: BotConfigWithPathImpl.fromJSON({
        name: '',
        description: '',
        padlock: '',
        services: [],
        path: ''
      }),
      endpoint: new EndpointService({
        type: ServiceTypes.Endpoint,
        name: '',
        id: uniqueId(),
        appId: '',
        appPassword: '',
        endpoint: ''
      }),
      secret: '',
      encryptKey: false,
      revealSecret: true
    };
  }

  render(): JSX.Element {
    const { secret, bot, endpoint, encryptKey, revealSecret } = this.state;
    const secretCriteria = encryptKey ? secret : true;

    const requiredFieldsCompleted = bot
      && endpoint.endpoint
      && bot.name
      && secretCriteria;

    const endpointWarning = this.validateEndpoint(endpoint.endpoint);
    const endpointPlaceholder = 'Your bot\'s endpoint (ex: http://localhost:3978/api/messages)';

    // TODO - localization
    return (
      <Dialog className={ styles.main } title="New bot configuration" cancel={ this.onCancel } maxWidth={ 648 }>
        <DialogContent className={ styles.botCreateForm }>
          <TextField
            className="c"
            inputClassName="bot-creation-input"
            value={ this.state.bot.name }
            onChanged={ this.onChangeName }
            label={ 'Bot name' }
            required={ true } />
          <TextField
            inputClassName="bot-creation-input"
            onChanged={ this.onChangeEndpoint }
            placeholder={ endpointPlaceholder } label={ 'Endpoint URL' }
            required={ true }
            value={ this.state.endpoint.endpoint } />
          { endpointWarning && <span className={ styles.endpointWarning }>{ endpointWarning }</span> }
          <Row className={ styles.multiInputRow }>
            <TextField
              className={ styles.smallInput }
              inputClassName="bot-creation-input"
              label="Microsoft App ID"
              onChanged={ this.onChangeAppId }
              placeholder="Optional"
              value={ endpoint.appId } />
            <TextField
              className={ styles.smallInput }
              inputClassName="bot-creation-input"
              label="Microsoft App password"
              onChanged={ this.onChangeAppPw }
              placeholder="Optional"
              type="password"
              value={ endpoint.appPassword } />
          </Row>

        <Row align={ RowAlignment.Bottom }>
          <Checkbox
            className={ styles.encryptKeyCheckBox }
            label="Encrypt keys stored in your bot configuration."
            checked={ encryptKey }
            onChange={ this.onEncryptKeyChange } />
          <a
            href="javascript:void(0);"
            onClick={ this.onLearnMoreEncryptionClick }>
            Learn more.
          </a>
        </Row>

          <TextField
            className={ styles.key }
            label="Secret "
            value={ secret }
            placeholder="Your keys are not encrypted"
            disabled={ true }
            id="key-input"
            type={ revealSecret ? 'text' : 'password' } />
          <ul className={ styles.actionsList }>
            <li>
              <a
                className={ !encryptKey ? styles.disabledAction : '' }
                href="javascript:void(0);"
                onClick={ this.onRevealSecretClick }>
                { revealSecret ? 'Hide' : 'Show' }
              </a>
            </li>
            <li>
              <a
                className={ !encryptKey ? styles.disabledAction : '' }
                href="javascript:void(0);"
                onClick={ this.onCopyClick }>
                Copy
              </a>
            </li>
            <li>
              <a
                className={ !encryptKey ? styles.disabledAction : '' }
                href="javascript:void(0);"
                onClick={ this.onResetClick }>
                Generate new secret
              </a>
            </li>
          </ul>

        </DialogContent>
        <DialogFooter>
          <DefaultButton
            text="Cancel"
            onClick={ this.onCancel }
            className="cancel-button"
          />
          <PrimaryButton
            text="Save and connect"
            onClick={ this.onSaveAndConnect }
            disabled={ !requiredFieldsCompleted }
            className="connect-button"
          />
        </DialogFooter>
      </Dialog>
    );
  }

  private onChangeEndpoint = (ep) => {
    const endpoint = { ...this.state.endpoint, endpoint: ep };
    this.setState({ endpoint });
  }

  private onChangeAppId = (appId) => {
    const endpoint = { ...this.state.endpoint, appId };
    this.setState({ endpoint });
  }

  private onChangeAppPw = (appPassword) => {
    const endpoint = { ...this.state.endpoint, appPassword };
    this.setState({ endpoint });
  }

  private onChangeName = (name) => {
    const bot = { ...this.state.bot, name };
    this.setState({ bot });
  }

  private onCancel = (e) => {
    DialogService.hideDialog();
  }

  private onEncryptKeyChange = (_ev: any, value: boolean) => {
    const secret = value ? generateBotSecret() : '';
    this.setState({ encryptKey: value, secret, revealSecret: true });
  }

  private onRevealSecretClick = () => {
    if (!this.state.encryptKey) {
      return null;
    }
    this.setState({ revealSecret: !this.state.revealSecret });
  }

  private onCopyClick = (): void => {
    if (!this.state.encryptKey) {
      return null;
    }
    const input: HTMLInputElement = window.document.getElementById('key-input') as HTMLInputElement;
    input.removeAttribute('disabled');
    const { type } = input;
    input.type = 'text';
    input.select();
    window.document.execCommand('copy');
    input.type = type;
    input.setAttribute('disabled', '');
  }

  private onResetClick = (): void => {
    if (!this.state.encryptKey) {
      return null;
    }
    const generatedSecret = generateBotSecret();
    this.setState({ secret: generatedSecret });
  }

  private onLearnMoreEncryptionClick = (): void => {
    const url = 'https://aka.ms/bot-framework-bot-file-encryption';
    CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.OpenExternal, url).catch();
  }

  private onSaveAndConnect = async (e) => {
    try {
      const path = await this.showBotSaveDialog();
      if (path) {
        this.performCreate(path);
      } else {
        // user cancelled out of the save dialog
        console.log('Bot creation save dialog was cancelled.');
      }
    } catch (e) {
      console.error('Error while trying to select a bot file location: ', e);
    }
  }

  private performCreate = (botPath: string) => {
    const endpoint: IEndpointService = {
      type: this.state.endpoint.type,
      name: this.state.endpoint.endpoint.trim(),
      id: this.state.endpoint.id.trim(),
      appId: this.state.endpoint.appId.trim(),
      appPassword: this.state.endpoint.appPassword.trim(),
      endpoint: this.state.endpoint.endpoint.trim()
    };

    const bot: BotConfigWithPath = BotConfigWithPathImpl.fromJSON({
      ...this.state.bot,
      name: this.state.bot.name.trim(),
      description: this.state.bot.description.trim(),
      services: [endpoint],
      path: botPath.trim()
    });

    const secret = this.state.encryptKey && this.state.secret ? this.state.secret : null;

    ActiveBotHelper.confirmAndCreateBot(bot, secret)
      .then(() => DialogService.hideDialog())
      .catch(err => {
        const errMsg = `Error during confirm and create bot: ${err}`;
        const notification = newNotification(errMsg);
        store.dispatch(beginAdd(notification));
      });
  }

  private showBotSaveDialog = async (): Promise<any> => {
    const { Commands } = SharedConstants;
    // get a safe bot file name
    const botFileName = await CommandServiceImpl.remoteCall(Commands.File.SanitizeString, this.state.bot.name);
    // TODO - Localization
    const dialogOptions = {
      filters: [
        {
          name: 'Bot Files',
          extensions: ['bot']
        }
      ],
      defaultPath: botFileName,
      showsTagField: false,
      title: 'Save as',
      buttonLabel: 'Save'
    };

    return CommandServiceImpl.remoteCall(Commands.Electron.ShowSaveDialog, dialogOptions);
  }

  /** Checks the endpoint to see if it has the correct route syntax at the end (/api/messages) */
  private validateEndpoint(endpoint: string): string {
    const controllerRegEx = /api\/messages\/?$/;
    return controllerRegEx.test(endpoint) ? '' : `Please include route if necessary: "/api/messages"`;
  }
}
