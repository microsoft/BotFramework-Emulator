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

import { BotInfo, newNotification, Notification, NotificationType, SharedConstants } from '@bfemulator/app-shared';
import { BotConfigWithPath, BotConfigWithPathImpl } from '@bfemulator/sdk-shared';
import {
  Checkbox,
  DefaultButton,
  Dialog,
  DialogFooter,
  LinkButton,
  PrimaryButton,
  Row,
  RowAlignment,
  TextField,
} from '@bfemulator/ui-react';
import { IConnectedService, ServiceTypes } from 'botframework-config/lib/schema';
import { ChangeEvent } from 'react';
import * as React from 'react';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

import { getBotInfoByPath } from '../../../state/helpers/botHelpers';
import { generateBotSecret } from '../../../utils';
import { ActiveBotHelper } from '../../helpers/activeBotHelper';
import * as styles from '../dialogStyles.scss';

export interface BotSettingsEditorProps {
  bot: BotConfigWithPath;
  cancel: () => void;
  sendNotification: (notification: Notification) => void;
  window: Window;
  onAnchorClick: (url: string) => void;
}

export interface BotSettingsEditorState extends BotConfigWithPath {
  secret?: string;
  revealSecret?: boolean;
  dirty?: boolean;
  encryptKey?: boolean;
}

export class BotSettingsEditor extends React.Component<BotSettingsEditorProps, BotSettingsEditorState> {
  @CommandServiceInstance()
  private commandService: CommandServiceImpl;

  private _generatedSecret: string;

  constructor(props: BotSettingsEditorProps, context: BotSettingsEditorState) {
    super(props, context);

    const { bot } = props;
    const botInfo = getBotInfoByPath(bot.path);
    const secret = botInfo && botInfo.secret;

    this.state = {
      ...bot,
      secret,
      revealSecret: false,
      encryptKey: !!secret,
    };
  }

  public componentWillReceiveProps(newProps: BotSettingsEditorProps) {
    const { path: newBotPath } = newProps.bot;
    // handling a new bot
    if (newBotPath !== this.state.path) {
      const newBotInfo: BotInfo = getBotInfoByPath(newBotPath) || {};

      this.setState({ ...newProps.bot, secret: newBotInfo.secret });
    }
  }

  public render() {
    const { name, dirty, secret, revealSecret, encryptKey } = this.state;
    const disabled = !name || !dirty;
    const error = !name ? 'The bot name is required' : '';
    return (
      <Dialog cancel={this.onCancel} title="Bot Settings" className={styles.main}>
        <TextField label="Name" value={name} required={true} onChange={this.onInputChange} errorMessage={error} />

        <Row align={RowAlignment.Bottom}>
          <Checkbox
            className={styles.encryptKeyCheckBox}
            label="Encrypt keys stored in your bot configuration."
            checked={encryptKey}
            onChange={this.onEncryptKeyChange}
          />
          <LinkButton
            ariaLabel="Learn more about bot file encryption"
            className={styles.dialogLink}
            linkRole={true}
            onClick={this.onLearnMoreEncryptionClick}
          >
            &nbsp;Learn more.
          </LinkButton>
        </Row>
        <Row align={RowAlignment.Bottom}>
          <TextField
            inputContainerClassName={styles.key}
            label="Secret "
            placeholder="Your keys are not encrypted"
            value={secret}
            disabled={true}
            id="key-input"
            type={revealSecret ? 'text' : 'password'}
          />
          <ul className={styles.actionsList}>
            <li>
              <LinkButton className={styles.dialogLink} disabled={!encryptKey} onClick={this.onRevealSecretClick}>
                {revealSecret ? 'Hide' : 'Show'}
              </LinkButton>
            </li>
            <li>
              <LinkButton className={styles.dialogLink} disabled={!encryptKey} onClick={this.onCopyClick}>
                Copy
              </LinkButton>
            </li>
            {/* <li>
              <LinkButton
                className={styles.dialogLink}
                onClick={this.onResetClick}>
                Generate new secret
              </LinkButton>
            </li> */}
          </ul>
        </Row>

        <DialogFooter>
          <DefaultButton text="Cancel" onClick={this.onCancel} />
          <PrimaryButton text="Save" onClick={this.onSaveClick} disabled={disabled} />
        </DialogFooter>
      </Dialog>
    );
  }

  private onCancel = () => {
    this.props.cancel();
  };

  private onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value: name } = event.target;
    this.setState({ name, dirty: true });
  };

  private onEncryptKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    this.setState({
      encryptKey: checked,
      secret: checked ? this.generatedSecret : '',
      dirty: true,
      revealSecret: checked ? checked : false,
    });
  };

  private onLearnMoreEncryptionClick = (): void => {
    this.props.onAnchorClick('https://aka.ms/bot-framework-bot-file-encryption');
  };

  private onSaveClick = async () => {
    const { name: botName = '', description = '', path, services, padlock = '', secret } = this.state;
    const bot: BotConfigWithPath = BotConfigWithPathImpl.fromJSON({
      name: botName.trim(),
      description: description.trim(),
      padlock: secret ? padlock : '',
      path: path.trim(),
      services,
    });

    const endpointService: IConnectedService = bot.services.find(service => service.type === ServiceTypes.Endpoint);

    if (bot.path === SharedConstants.TEMP_BOT_IN_MEMORY_PATH) {
      // we are currently using a mocked bot for livechat opened via protocol URI
      await this.saveBotFromProtocol(bot, endpointService, true);
    } else {
      // using a bot loaded from disk
      await this.saveBotFromDisk(bot);
    }
  };

  /** Saves a bot config from a mocked bot object used when opening a livechat session via protocol URI  */
  private saveBotFromProtocol = async (
    bot: BotConfigWithPath,
    endpointService: IConnectedService,
    connectArg: boolean
  ): Promise<void> => {
    const { Save, PatchBotList } = SharedConstants.Commands.Bot;
    // need to establish a location for the .bot file
    const newPath = await this.showBotSaveDialog();
    if (!newPath) {
      return null;
    }
    bot.path = newPath;
    // write new bot entry to bots.json
    const botInfo: BotInfo = {
      displayName: bot.name,
      path: newPath,
      secret: this.state.secret,
    };
    await this.commandService.remoteCall(PatchBotList, SharedConstants.TEMP_BOT_IN_MEMORY_PATH, botInfo);
    await this.commandService.remoteCall(Save, bot);
    // need to set the new bot as active now that it is no longer a placeholder bot in memory
    await ActiveBotHelper.setActiveBot(bot);
    this.setState({ ...bot });

    if (connectArg && endpointService) {
      await this.commandService.call(SharedConstants.Commands.Emulator.NewLiveChat, endpointService);
    }
    this.props.cancel();
  };

  /** Saves a bot config of a bot loaded from disk */
  private saveBotFromDisk = async (bot: BotConfigWithPath): Promise<void> => {
    const { Save, PatchBotList } = SharedConstants.Commands.Bot;
    // write updated bot entry to bots.json so main side can pick up possible changes to secret
    const botInfo: BotInfo = getBotInfoByPath(bot.path) || {};
    botInfo.secret = this.state.secret;
    await this.commandService.remoteCall(PatchBotList, bot.path, botInfo);

    // save bot
    try {
      await this.commandService.remoteCall(Save, bot);
    } catch {
      const note = newNotification(
        'There was an error updating your bot settings. ' +
          'Try removing encryption and saving again. You can then add encryption back once successful',
        NotificationType.Error
      );
      this.props.sendNotification(note);
      return;
    }
    await this.commandService.remoteCall(PatchBotList, bot.path, botInfo);
    this.props.cancel();
  };

  private showBotSaveDialog = async (): Promise<any> => {
    // get a safe bot file name
    // TODO - localization
    const { SanitizeString } = SharedConstants.Commands.File;
    const botFileName = await this.commandService.remoteCall(SanitizeString, this.state.name);
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
    return this.commandService.remoteCall(SharedConstants.Commands.Electron.ShowSaveDialog, dialogOptions);
  };

  private onRevealSecretClick = (): void => {
    if (!this.state.encryptKey) {
      return null;
    }
    this.setState({ revealSecret: !this.state.revealSecret });
  };

  private onCopyClick = (): void => {
    if (!this.state.encryptKey) {
      return null;
    }
    const { window } = this.props;
    const input: HTMLInputElement = window.document.getElementById('key-input') as HTMLInputElement;
    input.removeAttribute('disabled');
    const { type } = input;
    input.type = 'text';
    input.select();
    window.document.execCommand('copy');
    input.type = type;
    input.setAttribute('disabled', '');
  };

  // TODO: Re-enable ability to re-generate secret after 4.1
  // See 'https://github.com/Microsoft/BotFramework-Emulator/issues/964' for more information
  // See also: botSettingsEditor.spec.tsx

  // private onResetClick = (): void => {
  //   if (!this.state.encryptKey) {
  //     return null;
  //   }
  //   this._generatedSecret = null;
  //   const { generatedSecret } = this;
  //   this.setState({ secret: generatedSecret, padlock: '', dirty: true });
  // }

  private get generatedSecret(): string {
    if (this._generatedSecret) {
      return this._generatedSecret;
    }
    return generateBotSecret();
  }
}
