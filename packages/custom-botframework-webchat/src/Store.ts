import { Activity, ConnectionStatus, IBotConnection, Media, MediaType, Message, User } from 'botframework-directlinejs';
import { strings, defaultStrings, Strings } from './Strings';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Speech } from './SpeechModule';
import { ActivityOrID, FormatOptions } from './Types';
import { HostConfig } from 'adaptivecards';
import * as konsole from './Konsole';

// Reducers - perform state transformations

import { Reducer } from 'redux';

export const sendMessage = (text: string, from: User, locale: string) => ({
    type: 'Send_Message',
    activity: {
        type: "message",
        text,
        from,
        locale,
        textFormat: 'plain',
        timestamp: (new Date()).toISOString()
    }} as ChatActions);

export const sendFiles = (files: FileList, from: User, locale: string) => ({
    type: 'Send_Message',
    activity: {
        type: "message",
        attachments: attachmentsFromFiles(files),
        from,
        locale
    }} as ChatActions);

const attachmentsFromFiles = (files: FileList) => {
    const attachments: Media[] = [];
    for (let i = 0, numFiles = files.length; i < numFiles; i++) {
        const file = files[i];
        attachments.push({
            contentType: file.type as MediaType,
            contentUrl: window.URL.createObjectURL(file),
            name: file.name
        });
    }
    return attachments;
}

export interface ShellState {
    sendTyping: boolean
    input: string
    listening: boolean
    lastInputViaSpeech : boolean
}

export type ShellAction = {
    type: 'Update_Input',
    input: string
    source: "text" | "speech"
} | {
    type: 'Listening_Starting'
} | {
    type: 'Listening_Start'
} | {
    type: 'Listening_Stop'
} | {
    type: 'Stop_Speaking'
} |  {
    type: 'Card_Action_Clicked'
} | {
    type: 'Set_Send_Typing',
    sendTyping: boolean
} | {
    type: 'Send_Message',
    activity: Activity
}| {
    type: 'Speak_SSML',
    ssml: string,
    locale: string
    autoListenAfterSpeak: boolean
}

export const shell: Reducer<ShellState> = (
    state: ShellState = {
        input: '',
        sendTyping: false,
        listening : false,
        lastInputViaSpeech : false
    },
    action: ShellAction
) => {
    switch (action.type) {
        case 'Update_Input':
            return {
                ... state,
                input: action.input,
                lastInputViaSpeech : action.source == "speech"
            };

        case 'Listening_Start':
            return {
                ... state,
                listening: true
            };

        case 'Listening_Stop':
            return {
                ... state,
                listening: false
            };

        case 'Send_Message':
            return {
                ... state,
                input: ''
            };

        case 'Set_Send_Typing':
            return {
                ... state,
                sendTyping: action.sendTyping
            };

       case 'Card_Action_Clicked':
           return {
               ... state,
               lastInputViaSpeech : false
           };

        default:
        case 'Listening_Starting':
            return state;
    }
}

export interface FormatState {
    locale: string,
    options: FormatOptions,
    strings: Strings,
    carouselMargin: number
}

export type FormatAction = {
    type: 'Set_Format_Options',
    options: FormatOptions,
} | {
    type: 'Set_Locale',
    locale: string
} | {
    type: 'Set_Measurements',
    carouselMargin: number
}

export const format: Reducer<FormatState> = (
    state: FormatState = {
        locale: 'en-us',
        options: {
            showHeader: true
        },
        strings: defaultStrings,
        carouselMargin: undefined
    },
    action: FormatAction
) => {
    switch (action.type) {
        case 'Set_Format_Options':
            return {
                ... state,
                options: {
                    ... state.options,
                    ... action.options
                }
            };
        case 'Set_Locale':
            return {
                ... state,
                locale: action.locale,
                strings: strings(action.locale),
            };
        case 'Set_Measurements':
            return {
                ... state,
                carouselMargin: action.carouselMargin
            };
        default:
            return state;
    }
}

export interface SizeState {
    height: number,
    width: number,
}

export type SizeAction = {
    type: 'Set_Size',
    width: number,
    height: number
}

export const size: Reducer<SizeState> = (
    state: SizeState = {
        width: undefined,
        height: undefined
    },
    action: SizeAction
) => {
    switch (action.type) {
        case 'Set_Size':
            return {
                ... state,
                width: action.width,
                height: action.height
            };
        default:
            return state;
    }
}


export interface ConnectionState {
    connectionStatus: ConnectionStatus,
    botConnection: IBotConnection,
    selectedActivity: BehaviorSubject<ActivityOrID>,
    user: User,
    bot: User
}

export type ConnectionAction = {
    type: 'Start_Connection',
    botConnection: IBotConnection,
    user: User,
    bot: User,
    selectedActivity: BehaviorSubject<ActivityOrID>
} | {
    type: 'Connection_Change',
    connectionStatus: ConnectionStatus
}

export const connection: Reducer<ConnectionState> = (
    state: ConnectionState = {
        connectionStatus: ConnectionStatus.Uninitialized,
        botConnection: undefined,
        selectedActivity: undefined,
        user: undefined,
        bot: undefined
    },
    action: ConnectionAction
) => {
    switch (action.type) {
        case 'Start_Connection':
            return {
                ... state,
                botConnection: action.botConnection,
                user: action.user,
                bot: action.bot,
                selectedActivity: action.selectedActivity
            };
        case 'Connection_Change':
            return {
                ... state,
                connectionStatus: action.connectionStatus
            };
        default:
            return state;
    }
}

export interface HistoryState {
    activities: Activity[],
    clientActivityBase: string,
    clientActivityCounter: number,
    selectedActivity: Activity
}

export type HistoryAction = {
    type: 'Receive_Message' | 'Send_Message' | 'Show_Typing' | 'Receive_Sent_Message'
    activity: Activity
} | {
    type: 'Send_Message_Try' | 'Send_Message_Fail' | 'Send_Message_Retry',
    clientActivityId: string
} | {
    type: 'Send_Message_Succeed'
    clientActivityId: string
    id: string
} | {
    type: 'Select_Activity',
    selectedActivity: Activity
} | {
    type: 'Take_SuggestedAction',
    message: Message
} | {
    type: 'Clear_Typing',
    id: string
}

const copyArrayWithUpdatedItem = <T>(array: Array<T>, i: number, item: T) => [
    ... array.slice(0, i),
    item,
    ... array.slice(i + 1)
];

export const history: Reducer<HistoryState> = (
    state: HistoryState = {
        activities: [],
        clientActivityBase: Date.now().toString() + Math.random().toString().substr(1) + '.',
        clientActivityCounter: 0,
        selectedActivity: null
    },
    action: HistoryAction
) => {
    konsole.log("history action", action);
    switch (action.type) {
        case 'Receive_Sent_Message': {
            if (!action.activity.channelData || !action.activity.channelData.clientActivityId) {
                // only postBack messages don't have clientActivityId, and these shouldn't be added to the history
                return state;
            }
            const i = state.activities.findIndex(activity =>
                activity.channelData && activity.channelData.clientActivityId === action.activity.channelData.clientActivityId
            );
            if (i !== -1) {
                const activity = state.activities[i];
                return {
                    ... state,
                    activities: copyArrayWithUpdatedItem(state.activities, i, activity),
                    selectedActivity: state.selectedActivity === activity ? action.activity : state.selectedActivity
                };
            }
            // else fall through and treat this as a new message
        }
        case 'Receive_Message':
            if (state.activities.find(a => a.id === action.activity.id)) return state; // don't allow duplicate messages

            return {
                ... state,
                activities: [
                    ... state.activities.filter(activity => activity.type !== "typing"),
                    action.activity,
                    ... state.activities.filter(activity => activity.from.id !== action.activity.from.id && activity.type === "typing"),
                ]
            };

        case 'Send_Message':
            return {
                ... state,
                activities: [
                    ... state.activities.filter(activity => activity.type !== "typing"),
                    {
                        ... action.activity,
                        timestamp: (new Date()).toISOString(),
                        channelData: { clientActivityId: state.clientActivityBase + state.clientActivityCounter }
                    },
                    ... state.activities.filter(activity => activity.type === "typing"),
                ],
                clientActivityCounter: state.clientActivityCounter + 1
            };

        case 'Send_Message_Retry': {
            const activity = state.activities.find(activity =>
                activity.channelData && activity.channelData.clientActivityId === action.clientActivityId
            );
            const newActivity = activity.id === undefined ? activity : { ... activity, id: undefined };
            return {
                ... state,
                activities: [
                    ... state.activities.filter(activityT => activityT.type !== "typing" && activityT !== activity),
                    newActivity,
                    ... state.activities.filter(activity => activity.type === "typing")
                ],
                selectedActivity: state.selectedActivity === activity ? newActivity : state.selectedActivity
            };
        }
        case 'Send_Message_Succeed':
        case 'Send_Message_Fail': {
            const i = state.activities.findIndex(activity =>
                activity.channelData && activity.channelData.clientActivityId === action.clientActivityId
            );
            if (i === -1) return state;

            const activity = state.activities[i];
            if (activity.id && activity.id != "retry") return state;

            const newActivity = {
                ... activity,
                id: action.type === 'Send_Message_Succeed' ? action.id : null
            };
            return {
                ... state,
                activities: copyArrayWithUpdatedItem(state.activities, i, newActivity),
                clientActivityCounter: state.clientActivityCounter + 1,
                selectedActivity: state.selectedActivity === activity ? newActivity : state.selectedActivity
            };
        }
        case 'Show_Typing':
            return {
                ... state,
                activities: [
                    ... state.activities.filter(activity => activity.type !== "typing"),
                    ... state.activities.filter(activity => activity.from.id !== action.activity.from.id && activity.type === "typing"),
                    action.activity
                ]
            };

        case 'Clear_Typing':
            return {
                ... state,
                activities: state.activities.filter(activity => activity.id !== action.id),
                selectedActivity: state.selectedActivity && state.selectedActivity.id === action.id ? null : state.selectedActivity
            };

        case 'Select_Activity':
            if (action.selectedActivity === state.selectedActivity) return state;
            return {
                ... state,
                selectedActivity: action.selectedActivity
            };

        case 'Take_SuggestedAction':
            const i = state.activities.findIndex(activity => activity === action.message);
            const activity = state.activities[i];
            const newActivity = {
                ... activity,
                suggestedActions: undefined
            };
            return {
                ... state,
                activities: copyArrayWithUpdatedItem(state.activities, i, newActivity),
                selectedActivity: state.selectedActivity === activity ? newActivity : state.selectedActivity
            }

        default:
            return state;
    }
}

export interface AdaptiveCardsState {
    hostConfig: HostConfig
}

export type AdaptiveCardsAction = {
    type: 'Set_AdaptiveCardsHostConfig',
    payload: any
}

export const adaptiveCards: Reducer<AdaptiveCardsState> = (
    state: AdaptiveCardsState = {
        hostConfig: null
    },
    action: AdaptiveCardsAction
) => {
    switch (action.type) {
        case 'Set_AdaptiveCardsHostConfig':
            return {
                ...state,
                hostConfig: action.payload && (action.payload instanceof HostConfig ? action.payload : new HostConfig(action.payload))
            };

        default:
            return state;
    }
}


export type ChatActions = ShellAction | FormatAction | SizeAction | ConnectionAction | HistoryAction | AdaptiveCardsAction;

const nullAction = { type: null } as ChatActions;

export interface ChatState {
    adaptiveCards: AdaptiveCardsState,
    connection: ConnectionState,
    format: FormatState,
    history: HistoryState,
    shell: ShellState,
    size: SizeState
}

const speakFromMsg = (msg: Message, fallbackLocale: string) => {
    let speak = msg.speak;

    if (!speak && msg.textFormat == null || msg.textFormat == "plain")
        speak = msg.text;
    if (!speak && msg.channelData && msg.channelData.speechOutput && msg.channelData.speechOutput.speakText)
        speak = msg.channelData.speechOutput.speakText;
    if (!speak && msg.attachments && msg.attachments.length > 0)
        for (let i = 0; i < msg.attachments.length; i++) {
            var anymsg = <any>msg;
            if (anymsg.attachments[i]["content"] && anymsg.attachments[i]["content"]["speak"]) {
                speak = anymsg.attachments[i]["content"]["speak"];
                break;
            }
        }

    return {
            type : 'Speak_SSML',
            ssml: speak,
            locale: msg.locale || fallbackLocale,
            autoListenAfterSpeak : (msg.inputHint == "expectingInput") || (msg.channelData && msg.channelData.botState == "WaitingForAnswerToQuestion"),
    }
}

// Epics - chain actions together with async operations

import { applyMiddleware } from 'redux';
import { Epic } from 'redux-observable';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/takeUntil';

import 'rxjs/add/observable/bindCallback';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/of';


const sendMessageEpic: Epic<ChatActions, ChatState> = (action$, store) =>
    action$.ofType('Send_Message')
    .map(action => {
        const state = store.getState();
        const clientActivityId = state.history.clientActivityBase + (state.history.clientActivityCounter - 1);
        return ({ type: 'Send_Message_Try', clientActivityId } as HistoryAction);
    });

const trySendMessageEpic: Epic<ChatActions, ChatState> = (action$, store) =>
    action$.ofType('Send_Message_Try')
    .flatMap(action => {
        const state = store.getState();
        const clientActivityId = action.clientActivityId;
        const activity = state.history.activities.find(activity => activity.channelData && activity.channelData.clientActivityId === clientActivityId);
        if (!activity) {
            konsole.log("trySendMessage: activity not found");
            return Observable.empty<HistoryAction>();
        }

        if (state.history.clientActivityCounter == 1) {
            var capabilities = {
                type : 'ClientCapabilities',
                requiresBotState: true,
                supportsTts: true,
                supportsListening: true,
                // Todo: consider implementing acknowledgesTts: true
            };
            (<any>activity).entities  =(<any>activity).entities == null ? [capabilities] :  [...(<any>activity).entities, capabilities];
        }

        return state.connection.botConnection.postActivity(activity)
        .map(id => ({ type: 'Send_Message_Succeed', clientActivityId, id } as HistoryAction))
        .catch(error => Observable.of({ type: 'Send_Message_Fail', clientActivityId } as HistoryAction))
    });

const speakObservable = Observable.bindCallback<string, string, {}, {}>(Speech.SpeechSynthesizer.speak);

const speakSSMLEpic: Epic<ChatActions, ChatState> = (action$, store) =>
    action$.ofType('Speak_SSML')
    .filter(action => action.ssml )
    .mergeMap(action => {

        var onSpeakingStarted =  null;
        var onSpeakingFinished = () => nullAction;
        if(action.autoListenAfterSpeak) {
            onSpeakingStarted = () => Speech.SpeechRecognizer.warmup() ;
            onSpeakingFinished = () => ({ type: 'Listening_Starting' } as ShellAction);
        }

        const call$ = speakObservable(action.ssml, action.locale, onSpeakingStarted);
        return call$.map(onSpeakingFinished)
            .catch(error => Observable.of(nullAction));
    })
    .merge(action$.ofType('Speak_SSML').map(_ => ({ type: 'Listening_Stop' } as ShellAction)));

const speakOnMessageReceivedEpic: Epic<ChatActions, ChatState> = (action$, store) =>
    action$.ofType('Receive_Message')
    .filter(action => (action.activity as Message) && store.getState().shell.lastInputViaSpeech)
    .map(action => speakFromMsg(action.activity as Message, store.getState().format.locale) as ShellAction);

const stopSpeakingEpic: Epic<ChatActions, ChatState> = (action$) =>
    action$.ofType(
        'Update_Input',
        'Listening_Starting',
        'Send_Message',
        'Card_Action_Clicked',
        'Stop_Speaking'
    )
    .do(Speech.SpeechSynthesizer.stopSpeaking)
    .map(_ => nullAction)

const stopListeningEpic: Epic<ChatActions, ChatState> = (action$) =>
    action$.ofType(
        'Listening_Stop',
        'Card_Action_Clicked'
    )
    .do(Speech.SpeechRecognizer.stopRecognizing)
    .map(_ => nullAction)

const startListeningEpic: Epic<ChatActions, ChatState> = (action$, store) =>
    action$.ofType('Listening_Starting')
    .do((action : ShellAction) => {
        var locale = store.getState().format.locale;
        var onIntermediateResult = (srText : string) => { store.dispatch({ type: 'Update_Input', input: srText, source:"speech" })};
        var onFinalResult = (srText : string) => {
                srText = srText.replace(/^[.\s]+|[.\s]+$/g, "");
                onIntermediateResult(srText);
                store.dispatch({ type: 'Listening_Stop' });
                store.dispatch(sendMessage(srText, store.getState().connection.user, locale));
            };
        var onAudioStreamStart = () => { store.dispatch({ type: 'Listening_Start' }) };
        var onRecognitionFailed = () => { store.dispatch({ type: 'Listening_Stop' })};
        Speech.SpeechRecognizer.startRecognizing(locale, onIntermediateResult, onFinalResult, onAudioStreamStart, onRecognitionFailed);
    })
    .map(_ => nullAction)

const listeningSilenceTimeoutEpic: Epic<ChatActions, ChatState> = (action$, store) =>
{
    const cancelMessages$ = action$.ofType('Update_Input', 'Listening_Stop');
    return action$.ofType('Listening_Start')
        .mergeMap((action) =>
            Observable.of(({ type: 'Listening_Stop' }) as ShellAction)
            .delay(5000)
            .takeUntil(cancelMessages$));
};

const retrySendMessageEpic: Epic<ChatActions, ChatState> = (action$) =>
    action$.ofType('Send_Message_Retry')
    .map(action => ({ type: 'Send_Message_Try', clientActivityId: action.clientActivityId } as HistoryAction));

const updateSelectedActivityEpic: Epic<ChatActions, ChatState> = (action$, store) =>
    action$.ofType(
        'Send_Message_Succeed',
        'Send_Message_Fail',
        'Show_Typing',
        'Clear_Typing'
    )
    .map(action => {
        const state = store.getState();
        if (state.connection.selectedActivity)
            state.connection.selectedActivity.next({ activity: state.history.selectedActivity });
        return nullAction;
    });

const showTypingEpic: Epic<ChatActions, ChatState> = (action$) =>
    action$.ofType('Show_Typing')
    .delay(3000)
    .map(action => ({ type: 'Clear_Typing', id: action.activity.id } as HistoryAction));

const sendTypingEpic: Epic<ChatActions, ChatState> = (action$, store) =>
    action$.ofType('Update_Input')
    .map(_ => store.getState())
    .filter(state => state.shell.sendTyping)
    .throttleTime(3000)
    .do(_ => konsole.log("sending typing"))
    .flatMap(state =>
        state.connection.botConnection.postActivity({
            type: 'typing',
            from: state.connection.user
        })
        .map(_ => nullAction)
        .catch(error => Observable.of(nullAction))
    );

// Now we put it all together into a store with middleware

import { Store, createStore as reduxCreateStore, combineReducers } from 'redux';
import { combineEpics, createEpicMiddleware } from 'redux-observable';

export const createStore = () =>
    reduxCreateStore(
        combineReducers<ChatState>({
            adaptiveCards,
            connection,
            format,
            history,
            shell,
            size
        }),
        applyMiddleware(createEpicMiddleware(combineEpics(
            updateSelectedActivityEpic,
            sendMessageEpic,
            trySendMessageEpic,
            retrySendMessageEpic,
            showTypingEpic,
            sendTypingEpic,
            speakSSMLEpic,
            speakOnMessageReceivedEpic,
            startListeningEpic,
            stopListeningEpic,
            stopSpeakingEpic,
            listeningSilenceTimeoutEpic
        )))
    );

export type ChatStore = Store<ChatState>;
