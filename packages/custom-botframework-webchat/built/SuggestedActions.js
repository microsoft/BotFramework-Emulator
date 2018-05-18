"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_redux_1 = require("react-redux");
const Chat_1 = require("./Chat");
const HScroll_1 = require("./HScroll");
const Store_1 = require("./Store");
class SuggestedActionsContainer extends React.Component {
    constructor(props) {
        super(props);
    }
    actionClick(e, cardAction) {
        if (!this.props.activityWithSuggestedActions)
            return;
        this.props.takeSuggestedAction(this.props.activityWithSuggestedActions);
        this.props.doCardAction(cardAction.type, cardAction.value);
        e.stopPropagation();
    }
    shouldComponentUpdate(nextProps) {
        return !nextProps.activityWithSuggestedActions != !this.props.activityWithSuggestedActions;
    }
    render() {
        if (!this.props.activityWithSuggestedActions)
            return null;
        return (React.createElement("div", { className: "wc-suggested-actions" },
            React.createElement(HScroll_1.HScroll, { prevSvgPathData: "M 16.5 22 L 19 19.5 L 13.5 14 L 19 8.5 L 16.5 6 L 8.5 14 L 16.5 22 Z", nextSvgPathData: "M 12.5 22 L 10 19.5 L 15.5 14 L 10 8.5 L 12.5 6 L 20.5 14 L 12.5 22 Z", scrollUnit: "page" },
                React.createElement("ul", null, this.props.activityWithSuggestedActions.suggestedActions.actions.map((action, index) => React.createElement("li", { key: index },
                    React.createElement("button", { type: "button", onClick: e => this.actionClick(e, action), title: action.title }, action.title)))))));
    }
}
function activityWithSuggestedActions(activities) {
    if (!activities || activities.length === 0)
        return;
    const lastActivity = activities[activities.length - 1];
    if (lastActivity.type === 'message'
        && lastActivity.suggestedActions
        && lastActivity.suggestedActions.actions.length > 0)
        return lastActivity;
}
exports.SuggestedActions = react_redux_1.connect((state) => ({
    // passed down to MessagePaneView
    activityWithSuggestedActions: activityWithSuggestedActions(state.history.activities),
    // only used to create helper functions below
    botConnection: state.connection.botConnection,
    user: state.connection.user,
    locale: state.format.locale
}), {
    takeSuggestedAction: (message) => ({ type: 'Take_SuggestedAction', message }),
    // only used to create helper functions below
    sendMessage: Store_1.sendMessage
}, (stateProps, dispatchProps, ownProps) => ({
    // from stateProps
    activityWithSuggestedActions: stateProps.activityWithSuggestedActions,
    // from dispatchProps
    takeSuggestedAction: dispatchProps.takeSuggestedAction,
    // helper functions
    doCardAction: Chat_1.doCardAction(stateProps.botConnection, stateProps.user, stateProps.locale, dispatchProps.sendMessage),
}))(SuggestedActionsContainer);
//# sourceMappingURL=SuggestedActions.js.map