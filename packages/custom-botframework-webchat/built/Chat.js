"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_dom_1 = require("react-dom");
const custom_botframework_directlinejs_1 = require("@bfemulator/custom-botframework-directlinejs");
const Store_1 = require("./Store");
const react_redux_1 = require("react-redux");
const SpeechModule_1 = require("./SpeechModule");
const konsole = require("./Konsole");
const getTabIndex_1 = require("./getTabIndex");
const History_1 = require("./History");
const MessagePane_1 = require("./MessagePane");
const SuggestedActions_1 = require("./SuggestedActions");
const Shell_1 = require("./Shell");
class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.resizeListener = () => this.setSize();
        this._handleCardAction = this.handleCardAction.bind(this);
        this._handleKeyDownCapture = this.handleKeyDownCapture.bind(this);
        this._saveChatviewPanelRef = this.saveChatviewPanelRef.bind(this);
        this._saveHistoryRef = this.saveHistoryRef.bind(this);
        this._saveShellRef = this.saveShellRef.bind(this);
        konsole.log("BotChat.Chat props", props);
        this.store = props.store || Store_1.createStore();
        this.store.dispatch({
            type: 'Set_Locale',
            locale: props.locale || window.navigator["userLanguage"] || window.navigator.language || 'en'
        });
        if (props.adaptiveCardsHostConfig) {
            this.store.dispatch({
                type: 'Set_AdaptiveCardsHostConfig',
                payload: props.adaptiveCardsHostConfig
            });
        }
        if (props.formatOptions) {
            this.store.dispatch({ type: 'Set_Format_Options', options: props.formatOptions });
        }
        if (props.sendTyping) {
            this.store.dispatch({ type: 'Set_Send_Typing', sendTyping: props.sendTyping });
        }
        if (typeof props.showShell === 'boolean') {
            this.store.dispatch({ type: 'Set_Visible', visible: props.showShell });
        }
        if (props.speechOptions) {
            SpeechModule_1.Speech.SpeechRecognizer.setSpeechRecognizer(props.speechOptions.speechRecognizer);
            SpeechModule_1.Speech.SpeechSynthesizer.setSpeechSynthesizer(props.speechOptions.speechSynthesizer);
        }
    }
    handleIncomingActivity(activity) {
        let state = this.store.getState();
        switch (activity.type) {
            case "message":
                this.store.dispatch({ type: activity.from.id === state.connection.user.id ? 'Receive_Sent_Message' : 'Receive_Message', activity });
                break;
            case "typing":
                if (activity.from.id !== state.connection.user.id)
                    this.store.dispatch({ type: 'Show_Typing', activity });
                break;
        }
    }
    setSize() {
        this.store.dispatch({
            type: 'Set_Size',
            width: this.chatviewPanelRef.offsetWidth,
            height: this.chatviewPanelRef.offsetHeight
        });
    }
    handleCardAction() {
        // After the user click on any card action, we will "blur" the focus, by setting focus on message pane
        // This is for after click on card action, the user press "A", it should go into the chat box
        const historyDOM = react_dom_1.findDOMNode(this.historyRef);
        if (historyDOM) {
            historyDOM.focus();
        }
    }
    handleKeyDownCapture(evt) {
        const target = evt.target;
        const tabIndex = getTabIndex_1.getTabIndex(target);
        if (evt.altKey
            || evt.ctrlKey
            || evt.metaKey
            || (!inputtableKey(evt.key) && evt.key !== 'Backspace')) {
            // Ignore if one of the utility key (except SHIFT) is pressed
            // E.g. CTRL-C on a link in one of the message should not jump to chat box
            // E.g. "A" or "Backspace" should jump to chat box
            return;
        }
        if (target === react_dom_1.findDOMNode(this.historyRef)
            || typeof tabIndex !== 'number'
            || tabIndex < 0) {
            evt.stopPropagation();
            let key;
            // Quirks: onKeyDown we re-focus, but the newly focused element does not receive the subsequent onKeyPress event
            //         It is working in Chrome/Firefox/IE, confirmed not working in Edge/16
            //         So we are manually appending the key if they can be inputted in the box
            if (/(^|\s)Edge\/16\./.test(navigator.userAgent)) {
                key = inputtableKey(evt.key);
            }
            this.shellRef.focus(key);
        }
    }
    saveChatviewPanelRef(chatviewPanelRef) {
        this.chatviewPanelRef = chatviewPanelRef;
    }
    saveHistoryRef(historyWrapper) {
        if (!historyWrapper) {
            this.historyRef = null;
            return;
        }
        this.historyRef = historyWrapper.getWrappedInstance();
    }
    saveShellRef(shellWrapper) {
        if (!shellWrapper) {
            this.shellRef = null;
            return;
        }
        this.shellRef = shellWrapper.getWrappedInstance();
    }
    componentDidMount() {
        // Now that we're mounted, we know our dimensions. Put them in the store (this will force a re-render)
        this.setSize();
        const botConnection = this.props.directLine
            ? (this.botConnection = new custom_botframework_directlinejs_1.DirectLine(this.props.directLine))
            : this.props.botConnection;
        if (this.props.resize === 'window')
            window.addEventListener('resize', this.resizeListener);
        this.store.dispatch({ type: 'Start_Connection', user: this.props.user, bot: this.props.bot, botConnection, selectedActivity: this.props.selectedActivity });
        this.connectionStatusSubscription = botConnection.connectionStatus$.subscribe(connectionStatus => {
            if (this.props.speechOptions && this.props.speechOptions.speechRecognizer) {
                let refGrammarId = botConnection.referenceGrammarId;
                if (refGrammarId)
                    this.props.speechOptions.speechRecognizer.referenceGrammarId = refGrammarId;
            }
            this.store.dispatch({ type: 'Connection_Change', connectionStatus });
        });
        this.activitySubscription = botConnection.activity$.subscribe(activity => this.handleIncomingActivity(activity), error => konsole.log("activity$ error", error));
        if (this.props.selectedActivity) {
            this.selectedActivitySubscription = this.props.selectedActivity.subscribe(activityOrID => {
                this.store.dispatch({
                    type: 'Select_Activity',
                    selectedActivity: activityOrID.activity || this.store.getState().history.activities.find(activity => activity.id === activityOrID.id)
                });
            });
        }
    }
    componentWillUnmount() {
        this.connectionStatusSubscription.unsubscribe();
        this.activitySubscription.unsubscribe();
        if (this.selectedActivitySubscription)
            this.selectedActivitySubscription.unsubscribe();
        if (this.botConnection)
            this.botConnection.end();
        window.removeEventListener('resize', this.resizeListener);
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.adaptiveCardsHostConfig !== nextProps.adaptiveCardsHostConfig) {
            this.store.dispatch({
                type: 'Set_AdaptiveCardsHostConfig',
                payload: nextProps.adaptiveCardsHostConfig
            });
        }
    }
    // At startup we do three render passes:
    // 1. To determine the dimensions of the chat panel (nothing needs to actually render here, so we don't)
    // 2. To determine the margins of any given carousel (we just render one mock activity so that we can measure it)
    // 3. (this is also the normal re-render case) To render without the mock activity
    render() {
        const state = this.store.getState();
        konsole.log("BotChat.Chat state", state);
        // only render real stuff after we know our dimensions
        let header;
        if (state.format.options.showHeader)
            header =
                React.createElement("div", { className: "wc-header" },
                    React.createElement("span", null, state.format.strings.title));
        let resize;
        if (this.props.resize === 'detect')
            resize =
                React.createElement(ResizeDetector, { onresize: this.resizeListener });
        return (React.createElement(react_redux_1.Provider, { store: this.store },
            React.createElement("div", { className: "wc-chatview-panel", onKeyDownCapture: this._handleKeyDownCapture, ref: this._saveChatviewPanelRef },
                header,
                React.createElement(MessagePane_1.MessagePane, null,
                    React.createElement(History_1.History, { onCardAction: this._handleCardAction, ref: this._saveHistoryRef })),
                React.createElement(SuggestedActions_1.SuggestedActions, null),
                React.createElement(Shell_1.Shell, { ref: this._saveShellRef }),
                resize)));
    }
}
exports.Chat = Chat;
exports.doCardAction = (botConnection, from, locale, sendMessage) => (type, actionValue) => {
    const text = (typeof actionValue === 'string') ? actionValue : undefined;
    const value = (typeof actionValue === 'object') ? actionValue : undefined;
    switch (type) {
        case "imBack":
            if (typeof text === 'string')
                sendMessage(text, from, locale);
            break;
        case "postBack":
            exports.sendPostBack(botConnection, text, value, from, locale);
            break;
        case "call":
        case "openUrl":
        case "playAudio":
        case "playVideo":
        case "showImage":
        case "downloadFile":
        case "signin":
            window.open(text);
            break;
        default:
            konsole.log("unknown button type", type);
    }
};
exports.sendPostBack = (botConnection, text, value, from, locale) => {
    botConnection.postActivity({
        type: "message",
        text,
        value,
        from,
        locale
    })
        .subscribe(id => {
        konsole.log("success sending postBack", id);
    }, error => {
        konsole.log("failed to send postBack", error);
    });
};
exports.renderIfNonempty = (value, renderer) => {
    if (value !== undefined && value !== null && (typeof value !== 'string' || value.length > 0))
        return renderer(value);
};
exports.classList = (...args) => {
    return args.filter(Boolean).join(' ');
};
// note: container of this element must have CSS position of either absolute or relative
const ResizeDetector = (props) => 
// adapted to React from https://github.com/developit/simple-element-resize-detector
React.createElement("iframe", { style: { position: 'absolute', left: '0', top: '-100%', width: '100%', height: '100%', margin: '1px 0 0', border: 'none', opacity: 0, visibility: 'hidden', pointerEvents: 'none' }, ref: frame => {
        if (frame)
            frame.contentWindow.onresize = props.onresize;
    } });
// For auto-focus in some browsers, we synthetically insert keys into the chatbox.
// By default, we insert keys when:
// 1. evt.key.length === 1 (e.g. "1", "A", "=" keys), or
// 2. evt.key is one of the map keys below (e.g. "Add" will insert "+", "Decimal" will insert ".")
const INPUTTABLE_KEY = {
    Add: '+',
    Decimal: '.',
    Divide: '/',
    Multiply: '*',
    Subtract: '-' // Numpad subtract key
};
function inputtableKey(key) {
    return key.length === 1 ? key : INPUTTABLE_KEY[key];
}
//# sourceMappingURL=Chat.js.map