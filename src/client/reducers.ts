import { Reducer } from 'redux';
import { IBot } from '../types/botTypes';
import { IUser } from '../types/userTypes';
import { uniqueId } from '../utils';
import * as log from './log';
import {
    ISettings as IServerSettings,
    Settings as ServerSettings
} from '../types/serverSettingsTypes';
import {
    dispatch,
    ISettings,
    layoutDefault,
    addressBarDefault,
    conversationDefault,
    logDefault,
    inspectorDefault,
    ILayoutState,
    IAddressBarState,
    IConversationState,
    ILogState,
    IInspectorState,
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
}


type ConversationAction = {
    type: 'Conversation_SetConversationId',
    state: {
        conversationId: string
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
    static showAppSettings() {
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
        dispatch<AddressBarAction>({
            type: 'AddressBar_ShowBotCreds'
        })
    }
    static hideBotCreds() {
        dispatch<AddressBarAction>({
            type: 'AddressBar_HideBotCreds'
        })
    }
}

export class ConversationActions {
    static newConversation() {
        dispatch<ConversationAction>({
            type: 'Conversation_SetConversationId',
            state: {
                conversationId: uniqueId()
            }
        });
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
    static remote_setFrameworkPort(port: number) {
        serverChangeSetting('Framework_SetPort', { port });
    }
    static remote_setNgrokPath(path: string) {
        serverChangeSetting('Framework_SetNgrokPath', { path });
    }
    static remote_setFrameworkServerSettings(state: {
        port: number,
        ngrokPath: string
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
            return Object.assign({}, state, { selectedObject: action.state.selectedObject });
        case 'Inspector_Clear':
            return Object.assign({}, state, { selectedObject: null });
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
