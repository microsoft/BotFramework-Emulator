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

import { Reducer } from 'redux';
import { IBot } from '../types/botTypes';
import { IUser } from '../types/userTypes';
import { uniqueId } from '../shared/utils';
import * as log from './log';
import {
    ISettings as IServerSettings,
    Settings as ServerSettings
} from '../types/serverSettingsTypes';
import {
    dispatch,
    layoutDefault,
    addressBarDefault,
    conversationDefault,
    logDefault,
    wordWrapDefault,
    inspectorDefault,
    hotkeyDefault,
    ILayoutState,
    IAddressBarState,
    IConversationState,
    ILogState,
    IWordWrapState,
    IInspectorState,
    IHotkeyState,
    serverChangeSetting
} from './settings';


type LayoutAction = {
    type: 'Splitter_RememberHorizontal',
    state: {
        size: number
    }
} | {
    type: 'Splitter_RememberVertical',
    state: {
        size: number
    }
}

type wordWrapAction = {
    type: 'Log_SetWordWrap',
    state: {
        wordwrap: boolean
    }
}

type AddressBarAction = {
    type: 'AddressBar_SetText',
    state: {
        text: string
    }
} | {
    type: 'AddressBar_SetMatchingBots',
    state: {
        matchingBots: IBot[]
    }
} | {
    type: 'AddressBar_SelectBot',
    state: {
        bot: IBot
    }
} | {
    type: 'AddressBar_ShowAbout'
} | {
    type: 'AddressBar_HideAbout'
} | {
    type: 'AddressBar_ShowAppSettings'
} | {
    type: 'AddressBar_HideAppSettings'
} | {
    type: 'AddressBar_ShowConversationSettings'
} | {
    type: 'AddressBar_HideConversationSettings'
} | {
    type: 'AddressBar_ShowSearchResults'
} | {
    type: 'AddressBar_HideSearchResults'
} | {
    type: 'AddressBar_ShowBotCreds'
} | {
    type: 'AddressBar_HideBotCreds'
} | {
    type: 'AddressBar_GainFocus'
} | {
    type: 'AddressBar_LoseFocus'
}


type ConversationAction = {
    type: 'Conversation_SetConversationId',
    state: {
        conversationId: string
    }
} | {
    type: 'Conversation_AddUser',
    state: {
        name: string,
        id: string
    }
} | {
    type: 'Conversation_RemoveUser',
    state: {
        id: string
    }
}

type LogAction = {
    type: 'Log_SetAutoscroll',
    state: {
        autoscroll: boolean
    }
}

type InspectorAction = {
    type: 'Inspector_SetSelectedObject',
    state: {
        selectedObject: any
    }
} | {
    type: 'Inspector_Clear'
}

type HotkeyAction = {
    type: 'Hotkey_OpenMenu'
} | {
    type: 'Hotkey_OpenMenu_Clear'
} | {
    type: 'Hotkey_ToggleAddressBarFocus'
} | {
    type: 'Hotkey_ToggleAddressBarFocus_Clear'
}

type ServerSettingsAction = {
    type: 'ServerSettings_Set',
    state: {
        value: ServerSettings
    }
}

export class LayoutActions {
    static rememberHorizontalSplitter(size: number) {
        dispatch<LayoutAction>({
            type: 'Splitter_RememberHorizontal',
            state: {
                size: Number(size)
            }
        });
    }
    static rememberVerticalSplitter(size: number) {
        dispatch<LayoutAction>({
            type: 'Splitter_RememberVertical',
            state: {
                size: Number(size)
            }
        });
    }
}

export class WordWrapAction {
    static setWordWrap(wordwrap: boolean) {
        dispatch<LogAction>({
            type: 'Log_SetWordWrap',
            state: {
                wordwrap:wordwrap
            }
        });
    }
}

export class AddressBarActions {
    static setText(text: string) {
        dispatch<AddressBarAction>({
            type: 'AddressBar_SetText',
            state: {
                text
            }
        });
    }
    static setMatchingBots(matchingBots: IBot[]) {
        dispatch<AddressBarAction>({
            type: 'AddressBar_SetMatchingBots',
            state: {
                matchingBots
            }
        });
    }
    static selectBot(bot: IBot) {
        dispatch<AddressBarAction>({
            type: 'AddressBar_SelectBot',
            state: {
                bot
            }
        });
    }
    static showAbout() {
        this.hideBotCreds();
        this.hideSearchResults();
        dispatch<AddressBarAction>({
            type: 'AddressBar_ShowAbout'
        })
    }
    static hideAbout() {
        dispatch<AddressBarAction>({
            type: 'AddressBar_HideAbout'
        })
    }
    static showAppSettings() {
        this.hideBotCreds();
        this.hideSearchResults();
        dispatch<AddressBarAction>({
            type: 'AddressBar_ShowAppSettings'
        })
    }
    static hideAppSettings() {
        dispatch<AddressBarAction>({
            type: 'AddressBar_HideAppSettings'
        })
    }
    static showConversationSettings() {
        this.hideBotCreds();
        this.hideSearchResults();
        dispatch<AddressBarAction>({
            type: 'AddressBar_ShowConversationSettings'
        })
    }
    static hideConversationSettings() {
        dispatch<AddressBarAction>({
            type: 'AddressBar_HideConversationSettings'
        })
    }
    static showSearchResults() {
        this.hideBotCreds();
        dispatch<AddressBarAction>({
            type: 'AddressBar_ShowSearchResults'
        })
    }
    static hideSearchResults() {
        dispatch<AddressBarAction>({
            type: 'AddressBar_HideSearchResults'
        })
    }
    static showBotCreds() {
        this.hideSearchResults();
        dispatch<AddressBarAction>({
            type: 'AddressBar_ShowBotCreds'
        })
    }
    static hideBotCreds() {
        dispatch<AddressBarAction>({
            type: 'AddressBar_HideBotCreds'
        })
    }
    static gainFocus() {
        dispatch<AddressBarAction>({
            type: 'AddressBar_GainFocus'
        })
    }
    static loseFocus() {
        dispatch<AddressBarAction>({
            type: 'AddressBar_LoseFocus'
        })
    }
}

export class ConversationActions {
    static newConversation(conversationId?: number) {
        dispatch<ConversationAction>({
            type: 'Conversation_SetConversationId',
            state: {
                conversationId: conversationId || uniqueId()
            }
        });
    }
    static endConversation() {
        dispatch<ConversationAction>({
            type: 'Conversation_SetConversationId',
            state: {
                conversationId: null
            }
        })
    }
    static joinConversation(conversationId: string) {
        dispatch<ConversationAction>({
            type: 'Conversation_SetConversationId',
            state: {
                conversationId
            }
        });
    }
}

export class LogActions {
    static setAutoscroll(autoscroll: boolean) {
        dispatch<LogAction>({
            type: 'Log_SetAutoscroll',
            state: {
                autoscroll
            }
        });
    }
    static clear() {
        log.clear();
    }
}



export class InspectorActions {
    static setSelectedObject(selectedObject: any) {
        dispatch<InspectorAction>({
            type: 'Inspector_SetSelectedObject',
            state: {
                selectedObject
            }
        });
    }
    static clear() {
        dispatch<InspectorAction>({
            type: 'Inspector_Clear'
        });
    }
}

export class HotkeyActions {
    static openMenu() {
        dispatch<HotkeyAction>({
            type: 'Hotkey_OpenMenu'
        })
    }
    static clearOpenMenu() {
        dispatch<HotkeyAction>({
            type: 'Hotkey_OpenMenu_Clear'
        })
    }
    static toggleAddressBarFocus() {
        dispatch<HotkeyAction>({
            type: 'Hotkey_ToggleAddressBarFocus'
        })
    }
    static clearToggleAddressBarFocus() {
        dispatch<HotkeyAction>({
            type: 'Hotkey_ToggleAddressBarFocus_Clear'
        })
    }
}

export class ServerSettingsActions {
    static set(value: ServerSettings) {
        dispatch<ServerSettingsAction>({
            type: 'ServerSettings_Set',
            state: {
                value
            }
        });
    }
    static remote_addOrUpdateBot(bot: IBot) {
        serverChangeSetting('Bots_AddOrUpdateBot', { bot });
    }
    static remote_deleteBot(botId: string) {
        serverChangeSetting('Bots_RemoveBot', { botId });
    }
    static remote_setActiveBot(botId: string) {
        serverChangeSetting('ActiveBot_Set', { botId });
    }
    static remote_setCurrentUser(user: IUser) {
        serverChangeSetting('Users_SetCurrentUser', { user });
    }
    static remote_setFrameworkServerSettings(state: {
        ngrokPath: string,
        bypassNgrokLocalhost: boolean,
        use10Tokens: boolean,
        stateSizeLimit: number
    }) {
        serverChangeSetting('Framework_Set', state);
    }
}

export const layoutReducer: Reducer<ILayoutState> = (
    state = layoutDefault,
    action: LayoutAction
) => {
    switch (action.type) {
        case 'Splitter_RememberHorizontal':
            return Object.assign({}, state, { horizSplit: action.state.size });
        case 'Splitter_RememberVertical':
            return Object.assign({}, state, { vertSplit: action.state.size });
        default:
            return state;
    }
}

export const wordWrapReducer: Reducer<IWordWrapState> = (
    state = wordWrapDefault,
    action: wordWrapAction
) => {
    switch (action.type) {
        case 'Log_SetWordWrap':
            return Object.assign({}, state, { wordwrap: action.state.wordwrap });
        default:
            return state;
    }
}

export const addressBarReducer: Reducer<IAddressBarState> = (
    state = addressBarDefault,
    action: AddressBarAction
) => {
    switch (action.type) {
        case 'AddressBar_SetText':
            return Object.assign({}, state, { text: action.state.text });
        case 'AddressBar_SetMatchingBots':
            return Object.assign({}, state, { matchingBots: action.state.matchingBots });
        case 'AddressBar_SelectBot':
            return Object.assign({}, state, { selectedBot: action.state.bot });
        case 'AddressBar_ShowAbout':
            return Object.assign({}, state, { showAbout: true });
        case 'AddressBar_HideAbout':
            return Object.assign({}, state, { showAbout: false });
        case 'AddressBar_ShowAppSettings':
            return Object.assign({}, state, { showAppSettings: true });
        case 'AddressBar_HideAppSettings':
            return Object.assign({}, state, { showAppSettings: false });
        case 'AddressBar_ShowConversationSettings':
            return Object.assign({}, state, { showConversationSettings: true });
        case 'AddressBar_HideConversationSettings':
            return Object.assign({}, state, { showConversationSettings: false });
        case 'AddressBar_ShowSearchResults':
            return Object.assign({}, state, { showSearchResults: true });
        case 'AddressBar_HideSearchResults':
            return Object.assign({}, state, { showSearchResults: false });
        case 'AddressBar_ShowBotCreds':
            return Object.assign({}, state, { showBotCreds: true });
        case 'AddressBar_HideBotCreds':
            return Object.assign({}, state, { showBotCreds: false });
        case 'AddressBar_GainFocus':
            return Object.assign({}, state, { hasFocus: true });
        case 'AddressBar_LoseFocus':
            return Object.assign({}, state, { hasFocus: false });
        default:
            return state;
    }
}

export const conversationReducer: Reducer<IConversationState> = (
    state = conversationDefault,
    action: ConversationAction
) => {
    switch (action.type) {
        case 'Conversation_SetConversationId':
            return Object.assign({}, state, { conversationId: action.state.conversationId });
        default:
            return state;
    }
}

export const logReducer: Reducer<ILogState> = (
    state = logDefault,
    action: LogAction
) => {
    switch (action.type) {
        case 'Log_SetAutoscroll':
            return Object.assign({}, state, { autoscroll: action.state.autoscroll });
        default:
            return state;
    }
}


export const inspectorReducer: Reducer<IInspectorState> = (
    state = inspectorDefault,
    action: InspectorAction
) => {
    switch (action.type) {
        case 'Inspector_SetSelectedObject':
            return Object.assign({}, state, { selectedObject: action.state.selectedObject ? action.state.selectedObject.activity : null });
        case 'Inspector_Clear':
            return Object.assign({}, state, { selectedObject: null });
        default:
            return state;
    }
}

export const hotkeyReducer: Reducer<IHotkeyState> = (
    state = hotkeyDefault,
    action: HotkeyAction
) => {
    switch (action.type) {
        case 'Hotkey_OpenMenu':
            return Object.assign({}, state, { openMenu: true });
        case 'Hotkey_OpenMenu_Clear':
            return Object.assign({}, state, { openMenu: false });
        case 'Hotkey_ToggleAddressBarFocus':
            return Object.assign({}, state, { toggleAddressBarFocus: true });
        case 'Hotkey_ToggleAddressBarFocus_Clear':
            return Object.assign({}, state, { toggleAddressBarFocus: false });
        default:
            return state;
    }
}

export const serverSettingsReducer: Reducer<IServerSettings> = (
    state = {},
    action: ServerSettingsAction
) => {
    switch (action.type) {
        case 'ServerSettings_Set':
            return Object.assign({}, action.state.value);
        default:
            return state;
    }
}
