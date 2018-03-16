"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_redux_1 = require("react-redux");
var Chat_1 = require("./Chat");
var Store_1 = require("./Store");
var MessagePaneView = function (props) {
    return React.createElement("div", { className: 'wc-message-pane' }, props.children);
};
exports.MessagePane = react_redux_1.connect(function (state) { return ({
    // only used to create helper functions below
    botConnection: state.connection.botConnection,
    user: state.connection.user,
    locale: state.format.locale
}); }, {
    // only used to create helper functions below
    sendMessage: Store_1.sendMessage
}, function (stateProps, dispatchProps, ownProps) { return ({
    // from ownProps
    children: ownProps.children,
    // helper functions
    doCardAction: Chat_1.doCardAction(stateProps.botConnection, stateProps.user, stateProps.locale, dispatchProps.sendMessage),
}); })(MessagePaneView);
//# sourceMappingURL=MessagePane.js.map