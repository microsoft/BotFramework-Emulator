"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const adaptivecards_1 = require("adaptivecards");
class AdaptiveCardBuilder {
    constructor() {
        this.card = new adaptivecards_1.AdaptiveCard();
        this.container = new adaptivecards_1.Container();
        this.card.addItem(this.container);
    }
    addColumnSet(sizes, container) {
        container = container || this.container;
        const columnSet = new adaptivecards_1.ColumnSet();
        container.addItem(columnSet);
        const columns = sizes.map(size => {
            const column = new adaptivecards_1.Column();
            column.width = size;
            columnSet.addColumn(column);
            return column;
        });
        return columns;
    }
    addItems(cardElements, container) {
        container = container || this.container;
        cardElements.forEach(cardElement => container.addItem(cardElement));
    }
    addTextBlock(text, template, container) {
        container = container || this.container;
        if (typeof text !== 'undefined') {
            const textblock = new adaptivecards_1.TextBlock();
            for (let prop in template) {
                textblock[prop] = template[prop];
            }
            textblock.text = text;
            container.addItem(textblock);
        }
    }
    addButtons(cardActions, includesOAuthButtons) {
        if (cardActions) {
            cardActions.forEach(cardAction => {
                this.card.addAction(AdaptiveCardBuilder.addCardAction(cardAction, includesOAuthButtons));
            });
        }
    }
    static addCardAction(cardAction, includesOAuthButtons) {
        if (cardAction.type === 'imBack' || cardAction.type === 'postBack') {
            const action = new adaptivecards_1.SubmitAction();
            const botFrameworkCardAction = Object.assign({ __isBotFrameworkCardAction: true }, cardAction);
            action.data = botFrameworkCardAction;
            action.title = cardAction.title;
            return action;
        }
        else if (cardAction.type === 'signin' && includesOAuthButtons) {
            // Create a button specific for OAuthCard 'signin' actions (cardAction.type == signin and button action is Action.Submit)
            const action = new adaptivecards_1.SubmitAction();
            const botFrameworkCardAction = Object.assign({ __isBotFrameworkCardAction: true }, cardAction);
            action.title = cardAction.title,
                action.data = botFrameworkCardAction;
            return action;
        }
        else {
            const action = new adaptivecards_1.OpenUrlAction();
            const botFrameworkCardAction = Object.assign({ __isBotFrameworkCardAction: true }, cardAction);
            action.title = cardAction.title;
            action.url = cardAction.type === 'call' ? 'tel:' + cardAction.value : cardAction.value;
            return action;
        }
    }
    addCommonHeaders(content) {
        this.addTextBlock(content.title, { size: adaptivecards_1.TextSize.Medium, weight: adaptivecards_1.TextWeight.Bolder });
        this.addTextBlock(content.subtitle, { isSubtle: true, wrap: true });
        this.addTextBlock(content.text, { wrap: true });
    }
    addCommon(content) {
        this.addCommonHeaders(content);
        this.addButtons(content.buttons);
    }
    addImage(url, container, selectAction) {
        container = container || this.container;
        const image = new adaptivecards_1.Image();
        image.url = url;
        image.size = adaptivecards_1.Size.Stretch;
        if (selectAction) {
            image.selectAction = AdaptiveCardBuilder.addCardAction(selectAction);
        }
        container.addItem(image);
    }
}
exports.AdaptiveCardBuilder = AdaptiveCardBuilder;
exports.buildCommonCard = (content) => {
    if (!content)
        return null;
    const cardBuilder = new AdaptiveCardBuilder();
    cardBuilder.addCommon(content);
    return cardBuilder.card;
};
exports.buildOAuthCard = (content) => {
    if (!content)
        return null;
    const cardBuilder = new AdaptiveCardBuilder();
    cardBuilder.addCommonHeaders(content);
    cardBuilder.addButtons(content.buttons, true);
    return cardBuilder.card;
};
//# sourceMappingURL=CardBuilder.js.map