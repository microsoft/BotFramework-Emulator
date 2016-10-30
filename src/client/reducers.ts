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
    getStore,
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
        getStore().dispatch<LayoutAction>({
            type: 'Splitter_RememberHorizontal',
            state: {
                size
            }
        });
    }
    static rememberVerticalSplitter(size: number) {
        getStore().dispatch<LayoutAction>({
            type: 'Splitter_RememberVertical',
            state: {
                size
            }
        });
    }
}

export class AddressBarActions {
    static setText(text: string) {
        getStore().dispatch<AddressBarAction>({
            type: 'AddressBar_SetText',
            state: {
                text
            }
        });
    }
    static setMatchingBots(matchingBots: IBot[]) {
        getStore().dispatch<AddressBarAction>({
            type: 'AddressBar_SetMatchingBots',
            state: {
                matchingBots
            }
        });
    }
    static selectBot(bot: IBot) {
        getStore().dispatch<AddressBarAction>({
            type: 'AddressBar_SelectBot',
            state: {
                bot
            }
        });
    }
    static showAppSettings() {
        getStore().dispatch<AddressBarAction>({
            type: 'AddressBar_ShowAppSettings'
        })
    }
    static hideAppSettings() {
        getStore().dispatch<AddressBarAction>({
            type: 'AddressBar_HideAppSettings'
        })
    }
}

export class ConversationActions {
    static newConversation() {
        getStore().dispatch<ConversationAction>({
            type: 'Conversation_SetConversationId',
            state: {
                conversationId: uniqueId()
            }
        });
    }
    static joinConversation(conversationId: string) {
        getStore().dispatch<ConversationAction>({
            type: 'Conversation_SetConversationId',
            state: {
                conversationId
            }
        });
    }
}

export class LogActions {
    static setAutoscroll(autoscroll: boolean) {
        getStore().dispatch<LogAction>({
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
        getStore().dispatch<InspectorAction>({
            type: 'Inspector_SetSelectedObject',
            state: {
                selectedObject
            }
        });
    }
    static clear() {
        getStore().dispatch<InspectorAction>({
            type: 'Inspector_Clear'
        });
    }
}

export class ServerSettingsActions {
    static set(value: ServerSettings) {
        getStore().dispatch<ServerSettingsAction>({
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
