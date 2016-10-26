import { Reducer } from 'redux';
import { IBot } from '../types/botTypes';
import { IUser } from '../types/userTypes';
import { uniqueId } from '../utils';
import {
    ISettings as IServerSettings,
    Settings as ServerSettings }
    from '../server/settings';
import {
    getStore,
    ISettings,
    conversationDefault,
    addressBarDefault,
    layoutDefault,
    ILayoutState,
    IAddressBarState,
    IConversationState,
    serverChangeSetting }
    from './settings';


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
}

type ConversationAction = {
    type: 'Conversation_SetConversationId',
    state: {
        conversationId: string
    }
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
