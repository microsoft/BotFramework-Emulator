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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SharedConstants } from '@bfemulator/app-shared';
import { BotConfigWithPathImpl } from '@bfemulator/sdk-shared';
import { Column, MediumHeader, PrimaryButton, Row, TextField } from '@bfemulator/ui-react';
import { ServiceType } from 'msbot/bin/schema';
import * as React from 'react';
import { connect } from 'react-redux';
import * as EditorActions from '../../../data/action/editorActions';
import { getBotInfoByPath } from '../../../data/botHelpers';
import store from '../../../data/store';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';
import { ActiveBotHelper } from '../../helpers/activeBotHelper';
import { GenericDocument } from '../../layout';
import * as styles from './botSettingsEditor.scss';
class BotSettingsEditorComponent extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.onChangeName = (name) => {
            const bot = BotConfigWithPathImpl.fromJSON(Object.assign({}, this.state.bot, { name }));
            this.setState({ bot });
            this.setDirtyFlag(true);
        };
        this.onChangeSecret = (secret) => {
            this.setState({ secret });
            this.setDirtyFlag(true);
        };
        this.onSave = (_e, connectArg = false) => __awaiter(this, void 0, void 0, function* () {
            const { name: botName = '', description = '', path, services } = this.state.bot;
            let bot = BotConfigWithPathImpl.fromJSON({
                name: botName.trim(),
                description: description.trim(),
                secretKey: '',
                path: path.trim(),
                services
            });
            const endpointService = bot.services.find(service => service.type === ServiceType.Endpoint);
            if (bot.path === SharedConstants.TEMP_BOT_IN_MEMORY_PATH) {
                // we are currently using a mocked bot for livechat opened via protocol URI
                yield this.saveBotFromProtocol(bot, endpointService, connectArg);
            }
            else {
                // using a bot loaded from disk
                yield this.saveBotFromDisk(bot, endpointService, connectArg);
            }
        });
        /** Saves a bot config from a mocked bot object used when opening a livechat session via protocol URI  */
        this.saveBotFromProtocol = (bot, endpointService, connectArg) => __awaiter(this, void 0, void 0, function* () {
            // need to establish a location for the .bot file
            let newPath = yield this.showBotSaveDialog();
            if (newPath) {
                bot = Object.assign({}, bot, { path: newPath });
                // write new bot entry to bots.json
                const botInfo = {
                    displayName: bot.name,
                    path: newPath,
                    secret: this.state.secret
                };
                yield CommandServiceImpl
                    .remoteCall(SharedConstants.Commands.Bot.PatchBotList, SharedConstants.TEMP_BOT_IN_MEMORY_PATH, botInfo);
                yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Bot.Save, bot);
                // need to set the new bot as active now that it is no longer a placeholder bot in memory
                yield ActiveBotHelper.setActiveBot(bot);
                this.setDirtyFlag(false);
                this.setState({ bot });
                if (connectArg && endpointService) {
                    CommandServiceImpl.call(SharedConstants.Commands.Emulator.NewLiveChat, endpointService);
                }
            }
            else {
                // dialog was cancelled
                return null;
            }
        });
        /** Saves a bot config of a bot loaded from disk */
        this.saveBotFromDisk = (bot, endpointService, connectArg) => __awaiter(this, void 0, void 0, function* () {
            const botInfo = getBotInfoByPath(bot.path);
            botInfo.secret = this.state.secret;
            // write updated bot entry to bots.json
            yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Bot.PatchBotList, bot.path, botInfo);
            yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Bot.Save, bot);
            this.setDirtyFlag(false);
            this.setState({ bot });
            if (connectArg && endpointService) {
                CommandServiceImpl.call(SharedConstants.Commands.Emulator.NewLiveChat, endpointService);
            }
        });
        this.onSaveAndConnect = (e) => __awaiter(this, void 0, void 0, function* () {
            yield this.onSave(e, true);
        });
        this.showBotSaveDialog = () => __awaiter(this, void 0, void 0, function* () {
            // get a safe bot file name
            // TODO - localization
            const botFileName = yield CommandServiceImpl.remoteCall(SharedConstants.Commands.File.SanitizeString, this.state.bot.name);
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
        });
        const { bot } = props;
        const botInfo = getBotInfoByPath(bot.path);
        this.state = {
            bot,
            secret: (botInfo && botInfo.secret) || ''
        };
    }
    componentWillReceiveProps(newProps) {
        const { path: newBotPath } = newProps.bot;
        // handling a new bot
        if (newBotPath !== this.state.bot.path) {
            const newBotInfo = getBotInfoByPath(newBotPath);
            this.setState({ bot: newProps.bot, secret: newBotInfo.secret });
            this.setDirtyFlag(false);
        }
    }
    render() {
        const disabled = !this.state.bot.name || !this.props.dirty;
        const error = !this.state.bot.name ? 'The bot name is required' : '';
        return (React.createElement(GenericDocument, null,
            React.createElement(Column, null,
                React.createElement(MediumHeader, { className: styles.botSettingsHeader }, "Bot Settings"),
                React.createElement(TextField, { className: styles.botSettingsInput, label: "Bot name", value: this.state.bot.name, required: true, onChanged: this.onChangeName, errorMessage: error }),
                React.createElement(TextField, { className: styles.botSettingsInput, label: "Bot secret", value: this.state.secret, onChanged: this.onChangeSecret, type: "password" }),
                React.createElement(Row, { className: styles.buttonRow },
                    React.createElement(PrimaryButton, { text: "Save", onClick: this.onSave, className: styles.saveButton, disabled: disabled }),
                    React.createElement(PrimaryButton, { text: "Save & Connect", onClick: this.onSaveAndConnect, className: styles.saveConnectButton, disabled: disabled })))));
    }
    setDirtyFlag(dirty) {
        store.dispatch(EditorActions.setDirtyFlag(this.props.documentId, dirty));
    }
}
function mapStateToProps(state, _ownProps) {
    return {
        bot: state.bot.activeBot
    };
}
export const BotSettingsEditor = connect(mapStateToProps)(BotSettingsEditorComponent);
//# sourceMappingURL=botSettingsEditor.js.map