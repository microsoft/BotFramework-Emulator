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

import { beginAdd, executeCommand, isLinux, newNotification, SharedConstants } from '@bfemulator/app-shared';
import { BotConfigWithPath, BotConfigWithPathImpl, uniqueId } from '@bfemulator/sdk-shared';
import {
  Checkbox,
  DefaultButton,
  Dialog,
  DialogFooter,
  PrimaryButton,
  LinkButton,
  Row,
  RowAlignment,
  RowJustification,
  TextField,
} from '@bfemulator/ui-react';
import { EndpointService } from 'botframework-config/lib/models';
import { IEndpointService, ServiceTypes } from 'botframework-config/lib/schema';
import { ChangeEvent } from 'react';
import * as React from 'react';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

import { store } from '../../../state/store';
import { generateBotSecret, debounce, copyTextToClipboard } from '../../../utils';
import { ActiveBotHelper } from '../../helpers/activeBotHelper';
import { DialogService } from '../service';
import { ariaAlertService } from '../../a11y';
import * as dialogStyles from '../dialogStyles.scss';

import * as styles from './botCreationDialog.scss';

export interface BotCreationDialogProps {
  createAriaAlert: (msg: string) => void;
  showMessage?: (title: string, message: string) => void;
}

export interface BotCreationDialogState {
  bot: BotConfigWithPath;
  endpoint: IEndpointService;
  secret: string;
  encryptKey: boolean;
  revealSecret: boolean;
  isAzureGov: boolean;
}

export class BotCreationDialog extends React.Component<BotCreationDialogProps, BotCreationDialogState> {
  @CommandServiceInstance()
  public commandService: CommandServiceImpl;

  private secretInputRef: HTMLInputElement;

  public constructor(props: BotCreationDialogProps, context: BotCreationDialogState) {
    super(props, context);

    this.state = {
      bot: BotConfigWithPathImpl.fromJSON({
        name: '',
        description: '',
        padlock: '',
        services: [],
        path: '',
      }),
      endpoint: new EndpointService({
        type: ServiceTypes.Endpoint,
        name: '',
        id: uniqueId(),
        appId: '',
        appPassword: '',
        endpoint: '',
        tenantId: '',
      }),
      isAzureGov: false,
      secret: '',
      encryptKey: false,
      revealSecret: true,
    };
  }

  public render(): JSX.Element {
    const { secret, bot, endpoint, encryptKey, isAzureGov, revealSecret } = this.state;
    const secretCriteria = encryptKey ? secret : true;

    const requiredFieldsCompleted = bot && endpoint.endpoint && bot.name && secretCriteria;

    const endpointWarning = this.validateEndpoint(endpoint.endpoint);
    endpointWarning && this.announceEndpointWarning(endpointWarning);
    const endpointPlaceholder = "Your bot's endpoint (ex: http://localhost:3978/api/messages)";

    // TODO - localization
    return (
      <Dialog className={dialogStyles.main} title="New bot configuration" cancel={this.onCancel}>
        <div className={styles.botCreateForm}>
          <TextField
            value={bot.name}
            data-prop="name"
            onChange={this.onInputChange}
            label={'Bot name'}
            required={true}
            name={'create-bot-name'}
          />
          <TextField
            onChange={this.onInputChange}
            data-prop="endpoint"
            placeholder={endpointPlaceholder}
            label={'Endpoint URL'}
            required={true}
            value={endpoint.endpoint}
            name={'create-bot-url'}
          />
          {endpointWarning && <span className={styles.endpointWarning}>{endpointWarning}</span>}
          <Row className={styles.multiInputRow}>
            <TextField
              inputContainerClassName={dialogStyles.inputContainer}
              data-prop="appId"
              label="Microsoft App ID"
              onChange={this.onInputChange}
              placeholder="Optional"
              value={endpoint.appId}
            />
            <TextField
              inputContainerClassName={dialogStyles.inputContainer}
              label="Microsoft App password"
              ariaLabel={isLinux() ? 'Microsoft App' : null}
              data-prop="appPassword"
              onChange={this.onInputChange}
              placeholder="Optional"
              type="password"
              value={endpoint.appPassword}
            />
          </Row>
          <TextField
            name="tenantId"
            label="Tenant ID"
            onChange={this.onInputChange}
            placeholder="Optional"
            value={endpoint.tenantId}
          />
          <Row align={RowAlignment.Bottom}>
            <Checkbox label="Azure for US Government" checked={isAzureGov} onChange={this.onChannelServiceChange} />
            <LinkButton
              ariaLabel="Learn more about Azure for US Government."
              className={dialogStyles.dialogLink}
              linkRole={true}
              onClick={this.onAzureGovLinkClick}
            >
              &nbsp;Learn more.
            </LinkButton>
          </Row>
          <Row align={RowAlignment.Bottom}>
            <Checkbox
              className={dialogStyles.encryptKeyCheckBox}
              label="Encrypt keys stored in your bot configuration.&nbsp;"
              checked={encryptKey}
              onChange={this.onEncryptKeyChange}
            />
            <LinkButton
              ariaLabel="Learn more about bot file encryption"
              className={dialogStyles.dialogLink}
              linkRole={true}
              onClick={this.onBotEncryptionLinkClick}
            >
              Learn more.
            </LinkButton>
          </Row>
          <Row align={RowAlignment.Bottom} justify={RowJustification.Left}>
            <TextField
              aria-label="Bot encryption key"
              inputContainerClassName={dialogStyles.key}
              inputRef={this.setSecretInputRef}
              label="Secret "
              value={secret}
              placeholder={encryptKey ? '' : 'Your keys are not encrypted'}
              disabled={true}
              id="key-input"
              type={revealSecret ? 'text' : 'password'}
            />
            &nbsp;
            <ul className={dialogStyles.actionsList} role="region">
              <li>
                <LinkButton
                  ariaLabel={revealSecret ? 'Hide secret' : 'Show secret'}
                  className={dialogStyles.dialogLink}
                  disabled={!encryptKey}
                  onClick={this.onRevealSecretClick}
                >
                  {revealSecret ? 'Hide' : 'Show'}
                </LinkButton>
              </li>
              <li>
                <LinkButton
                  ariaLabel="Copy secret"
                  className={dialogStyles.dialogLink}
                  disabled={!encryptKey}
                  onClick={this.onCopyClick}
                >
                  Copy
                </LinkButton>
              </li>
              {/* <li>
                <LinkButton
                  className={dialogStyles.dialogLink}
                  onClick={ this.onResetClick }>
                  Generate new secret
                </LinkButton>
              </li> */}
            </ul>
          </Row>
        </div>

        <DialogFooter>
          <DefaultButton text="Cancel" onClick={this.onCancel} />
          <PrimaryButton
            text="Save and connect"
            onClick={this.onSaveAndConnect}
            disabled={!requiredFieldsCompleted}
            name={'create-bot-save'}
          />
        </DialogFooter>
      </Dialog>
    );
  }

  private createAnchorClickHandler = url => () =>
    store.dispatch(executeCommand(true, SharedConstants.Commands.Electron.OpenExternal, null, url));

  private onAzureGovLinkClick = this.createAnchorClickHandler('https://aka.ms/bot-framework-emulator-azuregov');

  private onBotEncryptionLinkClick = this.createAnchorClickHandler('https://aka.ms/bot-framework-bot-file-encryption');

  private onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const { prop } = event.target.dataset;
    if (prop === 'name') {
      // attach to bot
      this.setState({ bot: { ...this.state.bot, name: value } });
    } else {
      this.setState({
        endpoint: { ...this.state.endpoint, ...{ [prop]: value } },
      } as any);
    }
  };

  private onChannelServiceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    const channelService = checked ? 'https://botframework.azure.us' : '';
    this.setState({
      endpoint: {
        ...this.state.endpoint,
        ...{ channelService },
      },
      isAzureGov: checked,
    } as any);
  };

  private onCancel = () => {
    DialogService.hideDialog();
  };

  private onEncryptKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    const secret = checked ? generateBotSecret() : '';
    this.setState({ encryptKey: checked, secret, revealSecret: true });
  };

  private onRevealSecretClick = () => {
    if (!this.state.encryptKey) {
      return null;
    }
    const revealSecret = !this.state.revealSecret;
    ariaAlertService.alert(`Secret ${revealSecret ? 'showing' : 'hidden'}.`);
    this.setState({ revealSecret });

    // Reset focus to update the button caption
    const button = document.activeElement as HTMLButtonElement;
    button?.blur();
    setTimeout(() => {
      button?.focus();
    }, 100);
  };

  private onCopyClick = (): void => {
    if (!this.state.encryptKey) {
      return null;
    }
    if (copyTextToClipboard(this.secretInputRef.value)) {
      this.props.showMessage('Copy', 'Secret copied to clipboard.');
    } else {
      const err = 'Failed to copy secret to clipboard.';
      this.props.showMessage('Copy', err);
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  // TODO: Re-enable ability to re-generate secret after 4.1
  // See 'https://github.com/Microsoft/BotFramework-Emulator/issues/964' for more information
  // See also: botCreationDialog.spec.tsx

  // private onResetClick = (): void => {
  //   if (!this.state.encryptKey) {
  //     return null;
  //   }
  //   const generatedSecret = generateBotSecret();
  //   this.setState({ secret: generatedSecret });
  // }

  private onSaveAndConnect = async () => {
    try {
      const path = await this.showBotSaveDialog();
      if (path) {
        await this.performCreate(path);
      } else {
        // user cancelled out of the save dialog
        // eslint-disable-next-line no-console
        console.log('Bot creation save dialog was cancelled.');
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error while trying to select a bot file location: ', e);
    }
  };

  private performCreate = async (botPath: string) => {
    const endpoint: IEndpointService = {
      type: this.state.endpoint.type,
      name: this.state.endpoint.endpoint.trim(),
      id: this.state.endpoint.id.trim(),
      appId: this.state.endpoint.appId.trim(),
      appPassword: this.state.endpoint.appPassword.trim(),
      tenantId: this.state.endpoint.tenantId.trim(),
      endpoint: this.state.endpoint.endpoint.trim(),
    };
    (endpoint as any).channelService = (this.state.endpoint as any).channelService;

    const bot: BotConfigWithPath = BotConfigWithPathImpl.fromJSON({
      ...this.state.bot,
      name: this.state.bot.name.trim(),
      description: this.state.bot.description.trim(),
      services: [endpoint],
      path: botPath.trim(),
    });

    const secret = this.state.encryptKey && this.state.secret ? this.state.secret : null;

    try {
      await ActiveBotHelper.confirmAndCreateBot(bot, secret);
    } catch (err) {
      const errMsg = `Error during confirm and create bot: ${err}`;
      const notification = newNotification(errMsg);
      store.dispatch(beginAdd(notification));
    } finally {
      DialogService.hideDialog();
    }
  };

  private showBotSaveDialog = async (): Promise<any> => {
    const { Commands } = SharedConstants;
    // get a safe bot file name
    const botFileName = await this.commandService.remoteCall(Commands.File.SanitizeString, this.state.bot.name);
    // TODO - Localization
    const dialogOptions = {
      filters: [
        {
          name: 'Bot Files',
          extensions: ['bot'],
        },
      ],
      defaultPath: botFileName,
      showsTagField: false,
      title: 'Save as',
      buttonLabel: 'Save',
    };

    return this.commandService.remoteCall(Commands.Electron.ShowSaveDialog, dialogOptions);
  };

  /** Checks the endpoint to see if it has the correct route syntax at the end (/api/messages) */
  private validateEndpoint(endpoint: string): string {
    if (!endpoint) {
      // allow empty
      return '';
    }
    const controllerRegEx = /api\/messages\/?$/;
    return controllerRegEx.test(endpoint) ? '' : `Please include route if necessary: "/api/messages"`;
  }

  private setSecretInputRef = (ref: HTMLInputElement): void => {
    this.secretInputRef = ref;
  };

  private announceEndpointWarning = debounce((msg: string) => {
    this.props.createAriaAlert(`For Endpoint URL, ${msg}`);
  }, 2000);
}
