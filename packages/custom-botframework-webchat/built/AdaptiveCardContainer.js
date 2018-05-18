"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_dom_1 = require("react-dom");
const react_redux_1 = require("react-redux");
const adaptivecards_1 = require("adaptivecards");
const Chat_1 = require("./Chat");
const adaptivecardsHostConfig = require("../adaptivecards-hostconfig.json");
const defaultHostConfig = new adaptivecards_1.HostConfig(adaptivecardsHostConfig);
function cardWithoutHttpActions(card) {
    if (!card.actions)
        return card;
    const actions = [];
    card.actions.forEach((action) => {
        //filter out http action buttons
        if (action.type === 'Action.Http')
            return;
        if (action.type === 'Action.ShowCard') {
            const showCardAction = action;
            showCardAction.card = cardWithoutHttpActions(showCardAction.card);
        }
        actions.push(action);
    });
    return Object.assign({}, card, { actions });
}
class AdaptiveCardContainer extends React.Component {
    constructor(props) {
        super(props);
        this.handleImageLoad = this.handleImageLoad.bind(this);
        this.onClick = this.onClick.bind(this);
        this.saveDiv = this.saveDiv.bind(this);
    }
    saveDiv(divRef) {
        this.divRef = divRef;
    }
    onClick(e) {
        if (!this.props.onClick) {
            return;
        }
        //do not allow form elements to trigger a parent click event
        switch (e.target.tagName) {
            case 'A':
            case 'AUDIO':
            case 'VIDEO':
            case 'BUTTON':
            case 'INPUT':
            case 'LABEL':
            case 'TEXTAREA':
            case 'SELECT':
                break;
            default:
                this.props.onClick(e);
        }
    }
    onExecuteAction(action) {
        if (action instanceof adaptivecards_1.OpenUrlAction) {
            window.open(action.url);
        }
        else if (action instanceof adaptivecards_1.SubmitAction) {
            if (action.data !== undefined) {
                if (typeof action.data === 'object' && action.data.__isBotFrameworkCardAction) {
                    const cardAction = action.data;
                    this.props.onCardAction(cardAction.type, cardAction.value);
                }
                else {
                    this.props.onCardAction(typeof action.data === 'string' ? 'imBack' : 'postBack', action.data);
                }
            }
        }
    }
    componentDidMount() {
        this.mountAdaptiveCards();
    }
    componentDidUpdate(prevProps) {
        if (prevProps.hostConfig !== this.props.hostConfig
            || prevProps.jsonCard !== this.props.jsonCard
            || prevProps.nativeCard !== this.props.nativeCard) {
            this.unmountAdaptiveCards();
            this.mountAdaptiveCards();
        }
    }
    handleImageLoad() {
        this.props.onImageLoad && this.props.onImageLoad.apply(this, arguments);
    }
    unmountAdaptiveCards() {
        const divElement = react_dom_1.findDOMNode(this.divRef);
        [].forEach.call(divElement.children, (child) => divElement.removeChild(child));
    }
    mountAdaptiveCards() {
        const adaptiveCard = this.props.nativeCard || new adaptivecards_1.AdaptiveCard();
        adaptiveCard.hostConfig = this.props.hostConfig || defaultHostConfig;
        let errors = [];
        if (!this.props.nativeCard && this.props.jsonCard) {
            this.props.jsonCard.version = this.props.jsonCard.version || '0.5';
            adaptiveCard.parse(cardWithoutHttpActions(this.props.jsonCard));
            errors = adaptiveCard.validate();
        }
        adaptiveCard.onExecuteAction = (action) => this.onExecuteAction(action);
        if (errors.length === 0) {
            let renderedCard;
            try {
                renderedCard = adaptiveCard.render();
            }
            catch (e) {
                const ve = {
                    error: -1,
                    message: e
                };
                errors.push(ve);
                if (e.stack) {
                    ve.message += '\n' + e.stack;
                }
            }
            if (renderedCard) {
                if (this.props.onImageLoad) {
                    var imgs = renderedCard.querySelectorAll('img');
                    if (imgs && imgs.length > 0) {
                        Array.prototype.forEach.call(imgs, (img) => {
                            img.addEventListener('load', this.handleImageLoad);
                        });
                    }
                }
                react_dom_1.findDOMNode(this.divRef).appendChild(renderedCard);
                return;
            }
        }
        if (errors.length > 0) {
            console.log('Error(s) rendering AdaptiveCard:');
            errors.forEach(e => console.log(e.message));
            this.setState({ errors: errors.map(e => e.message) });
        }
    }
    render() {
        let wrappedChildren;
        const hasErrors = this.state && this.state.errors && this.state.errors.length > 0;
        if (hasErrors) {
            wrappedChildren = (React.createElement("div", null,
                React.createElement("svg", { className: "error-icon", viewBox: "0 0 15 12.01" },
                    React.createElement("path", { d: "M7.62 8.63v-.38H.94a.18.18 0 0 1-.19-.19V.94A.18.18 0 0 1 .94.75h10.12a.18.18 0 0 1 .19.19v3.73H12V.94a.91.91 0 0 0-.07-.36 1 1 0 0 0-.5-.5.91.91 0 0 0-.37-.08H.94a.91.91 0 0 0-.37.07 1 1 0 0 0-.5.5.91.91 0 0 0-.07.37v7.12a.91.91 0 0 0 .07.36 1 1 0 0 0 .5.5.91.91 0 0 0 .37.08h6.72c-.01-.12-.04-.24-.04-.37z M11.62 5.26a3.27 3.27 0 0 1 1.31.27 3.39 3.39 0 0 1 1.8 1.8 3.36 3.36 0 0 1 0 2.63 3.39 3.39 0 0 1-1.8 1.8 3.36 3.36 0 0 1-2.62 0 3.39 3.39 0 0 1-1.8-1.8 3.36 3.36 0 0 1 0-2.63 3.39 3.39 0 0 1 1.8-1.8 3.27 3.27 0 0 1 1.31-.27zm0 6a2.53 2.53 0 0 0 1-.21A2.65 2.65 0 0 0 14 9.65a2.62 2.62 0 0 0 0-2 2.65 2.65 0 0 0-1.39-1.39 2.62 2.62 0 0 0-2 0A2.65 2.65 0 0 0 9.2 7.61a2.62 2.62 0 0 0 0 2A2.65 2.65 0 0 0 10.6 11a2.53 2.53 0 0 0 1.02.26zM13 7.77l-.86.86.86.86-.53.53-.86-.86-.86.86-.53-.53.86-.86-.86-.86.53-.53.86.86.86-.86zM1.88 7.13h2.25V4.88H1.88zm.75-1.5h.75v.75h-.75zM5.63 2.63h4.5v.75h-4.5zM1.88 4.13h2.25V1.88H1.88zm.75-1.5h.75v.75h-.75zM9 5.63H5.63v.75h2.64A4 4 0 0 1 9 5.63z" })),
                React.createElement("div", { className: "error-text" }, "Can't render card")));
        }
        else if (this.props.children) {
            wrappedChildren = (React.createElement("div", { className: "non-adaptive-content" }, this.props.children));
        }
        else {
            wrappedChildren = null;
        }
        return (React.createElement("div", { className: Chat_1.classList('wc-card', 'wc-adaptive-card', this.props.className, hasErrors && 'error'), onClick: this.onClick },
            wrappedChildren,
            React.createElement("div", { ref: this.saveDiv })));
    }
}
exports.default = react_redux_1.connect((state) => ({
    hostConfig: state.adaptiveCards.hostConfig
}), {}, (stateProps, dispatchProps, ownProps) => (Object.assign({}, ownProps, stateProps)))(AdaptiveCardContainer);
//# sourceMappingURL=AdaptiveCardContainer.js.map