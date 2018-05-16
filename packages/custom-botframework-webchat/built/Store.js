"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const custom_botframework_directlinejs_1 = require("@bfemulator/custom-botframework-directlinejs");
const Strings_1 = require("./Strings");
const SpeechModule_1 = require("./SpeechModule");
const adaptivecards_1 = require("adaptivecards");
const konsole = require("./Konsole");
exports.sendMessage = (text, from, locale) => ({
    type: 'Send_Message',
    activity: {
        type: "message",
        text,
        from,
        locale,
        textFormat: 'plain',
        timestamp: (new Date()).toISOString()
    }
});
exports.sendFiles = (files, from, locale) => ({
    type: 'Send_Message',
    activity: {
        type: "message",
        attachments: attachmentsFromFiles(files),
        from,
        locale
    }
});
const attachmentsFromFiles = (files) => {
    const attachments = [];
    for (let i = 0, numFiles = files.length; i < numFiles; i++) {
        const file = files[i];
        attachments.push({
            contentType: file.type,
            contentUrl: window.URL.createObjectURL(file),
            name: file.name
        });
    }
    return attachments;
};
exports.shell = (state = {
    visible: true,
    input: '',
    sendTyping: false,
    listening: false,
    lastInputViaSpeech: false
}, action) => {
    switch (action.type) {
        case 'Update_Input':
            return Object.assign({}, state, { input: action.input, lastInputViaSpeech: action.source == "speech" });
        case 'Listening_Start':
            return Object.assign({}, state, { listening: true });
        case 'Listening_Stop':
            return Object.assign({}, state, { listening: false });
        case 'Send_Message':
            return Object.assign({}, state, { input: '' });
        case 'Set_Send_Typing':
            return Object.assign({}, state, { sendTyping: action.sendTyping });
        case 'Set_Visible':
            return Object.assign({}, state, { visible: action.visible });
        case 'Card_Action_Clicked':
            return Object.assign({}, state, { lastInputViaSpeech: false });
        default:
        case 'Listening_Starting':
            return state;
    }
};
exports.format = (state = {
    locale: 'en-us',
    options: {
        showHeader: true
    },
    strings: Strings_1.defaultStrings,
    carouselMargin: undefined
}, action) => {
    switch (action.type) {
        case 'Set_Format_Options':
            return Object.assign({}, state, { options: Object.assign({}, state.options, action.options) });
        case 'Set_Locale':
            return Object.assign({}, state, { locale: action.locale, strings: Strings_1.strings(action.locale) });
        case 'Set_Measurements':
            return Object.assign({}, state, { carouselMargin: action.carouselMargin });
        default:
            return state;
    }
};
exports.size = (state = {
    width: undefined,
    height: undefined
}, action) => {
    switch (action.type) {
        case 'Set_Size':
            return Object.assign({}, state, { width: action.width, height: action.height });
        default:
            return state;
    }
};
exports.connection = (state = {
    connectionStatus: custom_botframework_directlinejs_1.ConnectionStatus.Uninitialized,
    botConnection: undefined,
    selectedActivity: undefined,
    user: undefined,
    bot: undefined
}, action) => {
    switch (action.type) {
        case 'Start_Connection':
            return Object.assign({}, state, { botConnection: action.botConnection, user: action.user, bot: action.bot, selectedActivity: action.selectedActivity });
        case 'Connection_Change':
            return Object.assign({}, state, { connectionStatus: action.connectionStatus });
        default:
            return state;
    }
};
const copyArrayWithUpdatedItem = (array, i, item) => [
    ...array.slice(0, i),
    item,
    ...array.slice(i + 1)
];
exports.history = (state = {
    activities: [],
    clientActivityBase: Date.now().toString() + Math.random().toString().substr(1) + '.',
    clientActivityCounter: 0,
    selectedActivity: null
}, action) => {
    konsole.log("history action", action);
    switch (action.type) {
        case 'Receive_Sent_Message': {
            if (!action.activity.channelData || !action.activity.channelData.clientActivityId) {
                // only postBack messages don't have clientActivityId, and these shouldn't be added to the history
                return state;
            }
            const i = state.activities.findIndex(activity => activity.channelData && activity.channelData.clientActivityId === action.activity.channelData.clientActivityId);
            if (i !== -1) {
                const activity = state.activities[i];
                return Object.assign({}, state, { activities: copyArrayWithUpdatedItem(state.activities, i, activity), selectedActivity: state.selectedActivity === activity ? action.activity : state.selectedActivity });
            }
            // else fall through and treat this as a new message
        }
        case 'Receive_Message':
            if (state.activities.find(a => a.id === action.activity.id))
                return state; // don't allow duplicate messages
            return Object.assign({}, state, { activities: [
                    ...state.activities.filter(activity => activity.type !== "typing"),
                    action.activity,
                    ...state.activities.filter(activity => activity.from.id !== action.activity.from.id && activity.type === "typing"),
                ] });
        case 'Send_Message':
            return Object.assign({}, state, { activities: [
                    ...state.activities.filter(activity => activity.type !== "typing"),
                    Object.assign({}, action.activity, { timestamp: (new Date()).toISOString(), channelData: { clientActivityId: state.clientActivityBase + state.clientActivityCounter } }),
                    ...state.activities.filter(activity => activity.type === "typing"),
                ], clientActivityCounter: state.clientActivityCounter + 1 });
        case 'Send_Message_Retry': {
            const activity = state.activities.find(activity => activity.channelData && activity.channelData.clientActivityId === action.clientActivityId);
            const newActivity = activity.id === undefined ? activity : Object.assign({}, activity, { id: undefined });
            return Object.assign({}, state, { activities: [
                    ...state.activities.filter(activityT => activityT.type !== "typing" && activityT !== activity),
                    newActivity,
                    ...state.activities.filter(activity => activity.type === "typing")
                ], selectedActivity: state.selectedActivity === activity ? newActivity : state.selectedActivity });
        }
        case 'Send_Message_Succeed':
        case 'Send_Message_Fail': {
            const i = state.activities.findIndex(activity => activity.channelData && activity.channelData.clientActivityId === action.clientActivityId);
            if (i === -1)
                return state;
            const activity = state.activities[i];
            if (activity.id && activity.id != "retry")
                return state;
            const newActivity = Object.assign({}, activity, { id: action.type === 'Send_Message_Succeed' ? action.id : null });
            return Object.assign({}, state, { activities: copyArrayWithUpdatedItem(state.activities, i, newActivity), clientActivityCounter: state.clientActivityCounter + 1, selectedActivity: state.selectedActivity === activity ? newActivity : state.selectedActivity });
        }
        case 'Show_Typing':
            return Object.assign({}, state, { activities: [
                    ...state.activities.filter(activity => activity.type !== "typing"),
                    ...state.activities.filter(activity => activity.from.id !== action.activity.from.id && activity.type === "typing"),
                    action.activity
                ] });
        case 'Clear_Typing':
            return Object.assign({}, state, { activities: state.activities.filter(activity => activity.id !== action.id), selectedActivity: state.selectedActivity && state.selectedActivity.id === action.id ? null : state.selectedActivity });
        case 'Select_Activity':
            if (action.selectedActivity === state.selectedActivity)
                return state;
            return Object.assign({}, state, { selectedActivity: action.selectedActivity });
        case 'Take_SuggestedAction':
            const i = state.activities.findIndex(activity => activity === action.message);
            const activity = state.activities[i];
            const newActivity = Object.assign({}, activity, { suggestedActions: undefined });
            return Object.assign({}, state, { activities: copyArrayWithUpdatedItem(state.activities, i, newActivity), selectedActivity: state.selectedActivity === activity ? newActivity : state.selectedActivity });
        default:
            return state;
    }
};
exports.adaptiveCards = (state = {
    hostConfig: null
}, action) => {
    switch (action.type) {
        case 'Set_AdaptiveCardsHostConfig':
            return Object.assign({}, state, { hostConfig: action.payload && (action.payload instanceof adaptivecards_1.HostConfig ? action.payload : new adaptivecards_1.HostConfig(action.payload)) });
        default:
            return state;
    }
};
const nullAction = { type: null };
const speakFromMsg = (msg, fallbackLocale) => {
    let speak = msg.speak;
    if (!speak && msg.textFormat == null || msg.textFormat == "plain")
        speak = msg.text;
    if (!speak && msg.channelData && msg.channelData.speechOutput && msg.channelData.speechOutput.speakText)
        speak = msg.channelData.speechOutput.speakText;
    if (!speak && msg.attachments && msg.attachments.length > 0)
        for (let i = 0; i < msg.attachments.length; i++) {
            var anymsg = msg;
            if (anymsg.attachments[i]["content"] && anymsg.attachments[i]["content"]["speak"]) {
                speak = anymsg.attachments[i]["content"]["speak"];
                break;
            }
        }
    return {
        type: 'Speak_SSML',
        ssml: speak,
        locale: msg.locale || fallbackLocale,
        autoListenAfterSpeak: (msg.inputHint == "expectingInput") || (msg.channelData && msg.channelData.botState == "WaitingForAnswerToQuestion"),
    };
};
// Epics - chain actions together with async operations
const redux_1 = require("redux");
const Observable_1 = require("rxjs/Observable");
require("rxjs/add/operator/catch");
require("rxjs/add/operator/delay");
require("rxjs/add/operator/do");
require("rxjs/add/operator/filter");
require("rxjs/add/operator/map");
require("rxjs/add/operator/merge");
require("rxjs/add/operator/mergeMap");
require("rxjs/add/operator/throttleTime");
require("rxjs/add/operator/takeUntil");
require("rxjs/add/observable/bindCallback");
require("rxjs/add/observable/empty");
require("rxjs/add/observable/of");
const sendMessageEpic = (action$, store) => action$.ofType('Send_Message')
    .map(action => {
    const state = store.getState();
    const clientActivityId = state.history.clientActivityBase + (state.history.clientActivityCounter - 1);
    return { type: 'Send_Message_Try', clientActivityId };
});
const trySendMessageEpic = (action$, store) => action$.ofType('Send_Message_Try')
    .flatMap(action => {
    const state = store.getState();
    const clientActivityId = action.clientActivityId;
    const activity = state.history.activities.find(activity => activity.channelData && activity.channelData.clientActivityId === clientActivityId);
    if (!activity) {
        konsole.log("trySendMessage: activity not found");
        return Observable_1.Observable.empty();
    }
    if (state.history.clientActivityCounter == 1) {
        var capabilities = {
            type: 'ClientCapabilities',
            requiresBotState: true,
            supportsTts: true,
            supportsListening: true,
        };
        activity.entities = activity.entities == null ? [capabilities] : [...activity.entities, capabilities];
    }
    return state.connection.botConnection.postActivity(activity)
        .map(id => ({ type: 'Send_Message_Succeed', clientActivityId, id }))
        .catch(error => Observable_1.Observable.of({ type: 'Send_Message_Fail', clientActivityId }));
});
const speakObservable = Observable_1.Observable.bindCallback(SpeechModule_1.Speech.SpeechSynthesizer.speak);
const speakSSMLEpic = (action$, store) => action$.ofType('Speak_SSML')
    .filter(action => action.ssml)
    .mergeMap(action => {
    var onSpeakingStarted = null;
    var onSpeakingFinished = () => nullAction;
    if (action.autoListenAfterSpeak) {
        onSpeakingStarted = () => SpeechModule_1.Speech.SpeechRecognizer.warmup();
        onSpeakingFinished = () => ({ type: 'Listening_Starting' });
    }
    const call$ = speakObservable(action.ssml, action.locale, onSpeakingStarted, undefined);
    return call$.map(onSpeakingFinished)
        .catch(error => Observable_1.Observable.of(nullAction));
})
    .merge(action$.ofType('Speak_SSML').map(_ => ({ type: 'Listening_Stop' })));
const speakOnMessageReceivedEpic = (action$, store) => action$.ofType('Receive_Message')
    .filter(action => action.activity && store.getState().shell.lastInputViaSpeech)
    .map(action => speakFromMsg(action.activity, store.getState().format.locale));
const stopSpeakingEpic = (action$) => action$.ofType('Update_Input', 'Listening_Starting', 'Send_Message', 'Card_Action_Clicked', 'Stop_Speaking')
    .do(SpeechModule_1.Speech.SpeechSynthesizer.stopSpeaking)
    .map(_ => nullAction);
const stopListeningEpic = (action$) => action$.ofType('Listening_Stop', 'Card_Action_Clicked')
    .do(SpeechModule_1.Speech.SpeechRecognizer.stopRecognizing)
    .map(_ => nullAction);
const startListeningEpic = (action$, store) => action$.ofType('Listening_Starting')
    .do((action) => {
    var locale = store.getState().format.locale;
    var onIntermediateResult = (srText) => { store.dispatch({ type: 'Update_Input', input: srText, source: "speech" }); };
    var onFinalResult = (srText) => {
        srText = srText.replace(/^[.\s]+|[.\s]+$/g, "");
        onIntermediateResult(srText);
        store.dispatch({ type: 'Listening_Stop' });
        store.dispatch(exports.sendMessage(srText, store.getState().connection.user, locale));
    };
    var onAudioStreamStart = () => { store.dispatch({ type: 'Listening_Start' }); };
    var onRecognitionFailed = () => { store.dispatch({ type: 'Listening_Stop' }); };
    SpeechModule_1.Speech.SpeechRecognizer.startRecognizing(locale, onIntermediateResult, onFinalResult, onAudioStreamStart, onRecognitionFailed);
})
    .map(_ => nullAction);
const listeningSilenceTimeoutEpic = (action$, store) => {
    const cancelMessages$ = action$.ofType('Update_Input', 'Listening_Stop');
    return action$.ofType('Listening_Start')
        .mergeMap((action) => Observable_1.Observable.of(({ type: 'Listening_Stop' }))
        .delay(5000)
        .takeUntil(cancelMessages$));
};
const retrySendMessageEpic = (action$) => action$.ofType('Send_Message_Retry')
    .map(action => ({ type: 'Send_Message_Try', clientActivityId: action.clientActivityId }));
const updateSelectedActivityEpic = (action$, store) => action$.ofType('Send_Message_Succeed', 'Send_Message_Fail', 'Show_Typing', 'Clear_Typing')
    .map(action => {
    const state = store.getState();
    if (state.connection.selectedActivity)
        state.connection.selectedActivity.next({ activity: state.history.selectedActivity });
    return nullAction;
});
const showTypingEpic = (action$) => action$.ofType('Show_Typing')
    .delay(3000)
    .map(action => ({ type: 'Clear_Typing', id: action.activity.id }));
const sendTypingEpic = (action$, store) => action$.ofType('Update_Input')
    .map(_ => store.getState())
    .filter(state => state.shell.sendTyping)
    .throttleTime(3000)
    .do(_ => konsole.log("sending typing"))
    .flatMap(state => state.connection.botConnection.postActivity({
    type: 'typing',
    from: state.connection.user
})
    .map(_ => nullAction)
    .catch(error => Observable_1.Observable.of(nullAction)));
// Now we put it all together into a store with middleware
const redux_2 = require("redux");
const redux_observable_1 = require("redux-observable");
exports.createStore = () => redux_2.createStore(redux_2.combineReducers({
    adaptiveCards: exports.adaptiveCards,
    connection: exports.connection,
    format: exports.format,
    history: exports.history,
    shell: exports.shell,
    size: exports.size
}), redux_1.applyMiddleware(redux_observable_1.createEpicMiddleware(redux_observable_1.combineEpics(updateSelectedActivityEpic, sendMessageEpic, trySendMessageEpic, retrySendMessageEpic, showTypingEpic, sendTypingEpic, speakSSMLEpic, speakOnMessageReceivedEpic, startListeningEpic, stopListeningEpic, stopSpeakingEpic, listeningSilenceTimeoutEpic))));
//# sourceMappingURL=Store.js.map