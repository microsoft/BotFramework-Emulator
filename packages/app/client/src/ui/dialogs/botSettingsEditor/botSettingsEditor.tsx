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

import { BotInfo, SharedConstants } from '@bfemulator/app-shared';
import { BotConfigWithPath, BotConfigWithPathImpl } from '@bfemulator/sdk-shared';
import { Checkbox, DefaultButton, Dialog, DialogFooter, PrimaryButton, TextField } from '@bfemulator/ui-react';
import { IConnectedService, ServiceType } from 'msbot/bin/schema';
import * as React from 'react';
import { getBotInfoByPath } from '../../../data/botHelpers';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';
import { ActiveBotHelper } from '../../helpers/activeBotHelper';
import * as styles from './botSettingsEditor.scss';

export interface BotSettingsEditorProps {
  bot: BotConfigWithPath;
  cancel: () => void;
}

export interface BotSettingsEditorState extends BotConfigWithPath {
  secret?: string;
  revealSecret?: boolean;
  dirty?: boolean;
}

export class BotSettingsEditor extends React.Component<BotSettingsEditorProps, BotSettingsEditorState> {
  constructor(props: BotSettingsEditorProps, context: BotSettingsEditorState) {
    super(props, context);

    const { bot } = props;
    const botInfo = getBotInfoByPath(bot.path);

    this.state = {
      ...bot,
      secret: (botInfo && botInfo.secret) || '',
      revealSecret: false
    };
  }

  componentWillReceiveProps(newProps: BotSettingsEditorProps) {
    const { path: newBotPath } = newProps.bot;
    // handling a new bot
    if (newBotPath !== this.state.path) {
      const newBotInfo: BotInfo = getBotInfoByPath(newBotPath) || {};

      this.setState({ ...newProps.bot, secret: newBotInfo.secret });
    }
  }

  render() {
    const { name, dirty, secret, revealSecret } = this.state;
    const disabled = !name || !dirty;
    const error = !name ? 'The bot name is required' : '';
    return (
      <Dialog cancel={ this.onCancel } title="Bot Settings">
        <TextField label="Bot name" value={ name }
                   required={ true } onChanged={ this.onChangeName } errorMessage={ error }/>
        <TextField label="Bot secret" value={ secret }
                   onChanged={ this.onChangeSecret } type={ revealSecret ? 'text' : 'password' }/>
        <Checkbox
          label="Reveal secret"
          checked={ revealSecret }
          onChange={ this.onCheckSecretCheckbox }
        />
        <DialogFooter>
          <DefaultButton text="Cancel" onClick={ this.onCancel } className={ styles.saveButton }/>
          <PrimaryButton text="Save" onClick={ this.onSaveClick }
                         className={ styles.saveConnectButton }
                         disabled={ disabled }/>
        </DialogFooter>
      </Dialog>
    );
  }

  private onCancel = () => {
    this.props.cancel();
  }

  private onChangeName = (name) => {
    this.setState({ name, dirty: true });
  }

  private onChangeSecret = (secret) => {
    this.setState({ secret, dirty: true });
  }

  private onCheckSecretCheckbox = () => {
    this.setState({ revealSecret: !this.state.revealSecret });
  }

  private onSaveClick = async () => {
    const { name: botName = '', description = '', path, services, secretKey = '' } = this.state;
    let bot: BotConfigWithPath = BotConfigWithPathImpl.fromJSON({
      name: botName.trim(),
      description: description.trim(),
      secretKey,
      path: path.trim(),
      services
    });

    const endpointService: IConnectedService = bot.services.find(service => service.type === ServiceType.Endpoint);

    if (bot.path === SharedConstants.TEMP_BOT_IN_MEMORY_PATH) {
      // we are currently using a mocked bot for livechat opened via protocol URI
      await this.saveBotFromProtocol(bot, endpointService, true);
    } else {
      // using a bot loaded from disk
      await this.saveBotFromDisk(bot);
    }
  }

  /** Saves a bot config from a mocked bot object used when opening a livechat session via protocol URI  */
  private saveBotFromProtocol = async (bot: BotConfigWithPath, endpointService: IConnectedService, connectArg: boolean)
    : Promise<void> => {
    const { Save, PatchBotList } = SharedConstants.Commands.Bot;
    // need to establish a location for the .bot file
    let newPath = await this.showBotSaveDialog();
    if (!newPath) {
      return null;
    }
    bot.path = newPath;
    // write new bot entry to bots.json
    const botInfo: BotInfo = {
      displayName: bot.name,
      path: newPath,
      secret: this.state.secret
    };
    await CommandServiceImpl.remoteCall(PatchBotList, SharedConstants.TEMP_BOT_IN_MEMORY_PATH, botInfo);
    await CommandServiceImpl.remoteCall(Save, bot);
    // need to set the new bot as active now that it is no longer a placeholder bot in memory
    await ActiveBotHelper.setActiveBot(bot);
    this.setState({ ...bot });

    if (connectArg && endpointService) {
      await CommandServiceImpl.call(SharedConstants.Commands.Emulator.NewLiveChat, endpointService);
    }
    this.props.cancel();
  }

  /** Saves a bot config of a bot loaded from disk */
  private saveBotFromDisk = async (bot: BotConfigWithPath): Promise<void> => {
    const { Save, PatchBotList } = SharedConstants.Commands.Bot;
    const botInfo: BotInfo = getBotInfoByPath(bot.path) || {};
    botInfo.secret = this.state.secret;
    // write updated bot entry to bots.json
    await CommandServiceImpl.remoteCall(PatchBotList, bot.path, botInfo);
    await CommandServiceImpl.remoteCall(Save, bot);
    this.props.cancel();
  }

  private showBotSaveDialog = async (): Promise<any> => {
    // get a safe bot file name
    // TODO - localization
    const { SanitizeString } = SharedConstants.Commands.File;
    const botFileName = await CommandServiceImpl.remoteCall(SanitizeString, this.state.name);
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
    return CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.ShowSaveDialog, dialogOptions);
  }
}
