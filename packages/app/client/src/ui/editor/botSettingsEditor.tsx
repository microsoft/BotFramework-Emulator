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
import { Colors, Column, MediumHeader, PrimaryButton, Row, TextInputField } from '@bfemulator/ui-react';
import { css } from 'glamor';
import { IConnectedService, ServiceType } from 'msbot/bin/schema';
import * as React from 'react';
import { connect } from 'react-redux';
import * as EditorActions from '../../data/action/editorActions';
import { getBotInfoByPath } from '../../data/botHelpers';
import store, { RootState } from '../../data/store';
import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';
import { ActiveBotHelper } from '../helpers/activeBotHelper';
import { GenericDocument } from '../layout';

const CSS = css({
  '& .bot-settings-header': {
    marginBottom: '16px'
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

  '& .bot-settings-input': {
    color: Colors.APP_FOREGROUND_DARK
  }
});

interface BotSettingsEditorProps {
  bot?: BotConfigWithPath;
  dirty?: boolean;
  documentId?: string;
}

interface BotSettingsEditorState {
  bot?: BotConfigWithPath;
  secret?: string;
}

class BotSettingsEditorComponent extends React.Component<BotSettingsEditorProps, BotSettingsEditorState> {
  constructor(props: BotSettingsEditorProps, context: BotSettingsEditorState) {
    super(props, context);

    const { bot } = props;
    const botInfo = getBotInfoByPath(bot.path);

    this.state = {
      bot,
      secret: (botInfo && botInfo.secret) || ''
    };
  }

  componentWillReceiveProps(newProps: BotSettingsEditorProps) {
    const { path: newBotPath } = newProps.bot;
    // handling a new bot
    if (newBotPath !== this.state.bot.path) {
      const newBotInfo: BotInfo = getBotInfoByPath(newBotPath);

      this.setState({ bot: newProps.bot, secret: newBotInfo.secret });
      this.setDirtyFlag(false);
    }
  }

  render() {
    const disabled = !this.state.bot.name || !this.props.dirty;
    const error = !this.state.bot.name ? 'The bot name is required' : '';
    return (
      <GenericDocument style={CSS}>
        <Column>
          <MediumHeader className="bot-settings-header">Bot Settings</MediumHeader>
          <TextInputField className="bot-settings-input" label="Bot name" value={this.state.bot.name}
            required={true} onChanged={this.onChangeName} errorMessage={error} />
          <TextInputField className="bot-settings-input" label="Bot secret" value={this.state.secret}
            onChanged={this.onChangeSecret} type="password" />
          <Row className="button-row">
            <PrimaryButton text="Save" onClick={this.onSave} className="save-button" disabled={disabled} />
            <PrimaryButton text="Save & Connect" onClick={this.onSaveAndConnect} className="save-connect-button"
              disabled={disabled} />
          </Row>
        </Column>
      </GenericDocument>
    );
  }

  private onChangeName = (name) => {
    const bot: BotConfigWithPath = BotConfigWithPathImpl.fromJSON({ ...this.state.bot, name });
    this.setState({ bot });
    this.setDirtyFlag(true);
  }

  private onChangeSecret = (secret) => {
    this.setState({ secret });
    this.setDirtyFlag(true);
  }

  private onSave = async (_e, connectArg = false) => {
    const { name: botName = '', description = '', path, services } = this.state.bot;
    let bot: BotConfigWithPath = BotConfigWithPathImpl.fromJSON({
      name: botName.trim(),
      description: description.trim(),
      secretKey: '',
      path: path.trim(),
      services
    });

    const endpointService: IConnectedService = bot.services.find(service => service.type === ServiceType.Endpoint);

    if (bot.path === SharedConstants.TEMP_BOT_IN_MEMORY_PATH) {
      // we are currently using a mocked bot for livechat opened via protocol URI
      await this.saveBotFromProtocol(bot, endpointService, connectArg);
    } else {
      // using a bot loaded from disk
      await this.saveBotFromDisk(bot, endpointService, connectArg);
    }
  }

  /** Saves a bot config from a mocked bot object used when opening a livechat session via protocol URI  */
  private saveBotFromProtocol = async (bot: BotConfigWithPath, endpointService: IConnectedService, connectArg: boolean)
    : Promise<void> => {
    // need to establish a location for the .bot file
    let newPath = await this.showBotSaveDialog();
    if (newPath) {
      bot = {
        ...bot,
        path: newPath
      };

      // write new bot entry to bots.json
      const botInfo: BotInfo = {
        displayName: bot.name,
        path: newPath,
        secret: this.state.secret
      };
      await CommandServiceImpl.remoteCall('bot:list:patch', SharedConstants.TEMP_BOT_IN_MEMORY_PATH, botInfo);

      await CommandServiceImpl.remoteCall('bot:save', bot);

      // need to set the new bot as active now that it is no longer a placeholder bot in memory
      await ActiveBotHelper.setActiveBot(newPath);

      this.setDirtyFlag(false);
      this.setState({ bot });

      if (connectArg && endpointService) {
        CommandServiceImpl.call('livechat:new', endpointService);
      }
    } else {
      // dialog was cancelled
      return null;
    }
  }

  /** Saves a bot config of a bot loaded from disk */
  private saveBotFromDisk = async (bot: BotConfigWithPath, endpointService: IConnectedService, connectArg: boolean)
    : Promise<void> => {
    const botInfo: BotInfo = getBotInfoByPath(bot.path);
    botInfo.secret = this.state.secret;

    // write updated bot entry to bots.json
    await CommandServiceImpl.remoteCall('bot:list:patch', bot.path, botInfo);

    await CommandServiceImpl.remoteCall('bot:save', bot);

    this.setDirtyFlag(false);
    this.setState({ bot });

    if (connectArg && endpointService) {
      CommandServiceImpl.call('livechat:new', endpointService);
    }
  }

  private onSaveAndConnect = async e => {
    await this.onSave(e, true);
  }

  private setDirtyFlag(dirty: boolean) {
    store.dispatch(EditorActions.setDirtyFlag(this.props.documentId, dirty));
  }

  private showBotSaveDialog = async (): Promise<any> => {
    // get a safe bot file name
    // TODO - localization
    const botFileName = await CommandServiceImpl.remoteCall('file:sanitize-string', this.state.bot.name);
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

    return CommandServiceImpl.remoteCall('shell:showSaveDialog', dialogOptions);
  }
}

function mapStateToProps(state: RootState, _ownProps: {}): BotSettingsEditorProps {
  return {
    bot: state.bot.activeBot
  };
}

export const BotSettingsEditor = connect(mapStateToProps)(BotSettingsEditorComponent) as any;
