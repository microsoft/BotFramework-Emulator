"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_redux_1 = require("react-redux");
const Chat_1 = require("./Chat");
const Store_1 = require("./Store");
const MessagePaneView = (props) => React.createElement("div", { className: 'wc-message-pane' }, props.children);
exports.MessagePane = react_redux_1.connect((state) => ({
    // only used to create helper functions below
    botConnection: state.connection.botConnection,
    user: state.connection.user,
    locale: state.format.locale
}), {
    // only used to create helper functions below
    sendMessage: Store_1.sendMessage
}, (stateProps, dispatchProps, ownProps) => ({
    // from ownProps
    children: ownProps.children,
    // helper functions
    doCardAction: Chat_1.doCardAction(stateProps.botConnection, stateProps.user, stateProps.locale, dispatchProps.sendMessage),
}))(MessagePaneView);
//# sourceMappingURL=MessagePane.js.map