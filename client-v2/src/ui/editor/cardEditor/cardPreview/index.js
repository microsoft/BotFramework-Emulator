//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import { connect } from 'react-redux'
import { css } from 'glamor'
import React from 'react'
import * as AdaptiveCards from 'adaptivecards';

const CSS = css({
    margin: "24px 0 12px 0",
    width: "100%",
    height: "100%",
    overflow: "auto",

    " .preview-header": {
        paddingLeft: "24px",
        fontFamily: "Segoe UI Semibold",
        textTransform: "uppercase",
        backgroundColor: "#F5F5F5",
        width: "100%",
        display: "block",
        color: "#2B2B2B",
        borderBottom: "1px solid #C6C6C6"
    }
});

const debug = css({ backgroundColor: "white", border: "1px solid black" });

// define card render options
var renderOptions = {

    // a Host Config defines the style and behavior of all cards
    hostConfig: {
        "fontFamily": "Segoe UI, Helvetica Nue, sans-serif"
    },

    // the action handler is invoked when actions are pressed
    onExecuteAction: processAction
};

class CardPreview extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.saveCardContainer = this.saveCardContainer.bind(this);
    }

    componentDidMount() {
        // we must wait for the component to mount then render the card and insert it into the DOM
        var renderedCard = AdaptiveCards.renderCard(JSON.parse(this.props.cardJson), renderOptions);
        this.cardContainer.appendChild(renderedCard);
    }

    componentWillReceiveProps(newProps) {
        // During editing, invalid JSON will cause JSON.parse() to throw an error,
        // which will crash the entire component. We want to catch those errors and throw them away.
        try {
            const newPreRenderedCard = JSON.parse(newProps.cardJson);
            const renderedCard = AdaptiveCards.renderCard(newPreRenderedCard, renderOptions);
            this.cardContainer.removeChild(this.cardContainer.firstChild);
            this.cardContainer.appendChild(renderedCard);
        } catch(e) {
            // don't do anything
        }
    }

    saveCardContainer(element) {
        this.cardContainer = element;
    }

    render() {
        return(
            <div {...CSS} {...debug}>
                <span className={"preview-header"}>Preview</span>
                <div ref={ this.saveCardContainer }></div>
            </div>
        );
    }
}

function processAction() {
    return null;
}

export default connect(state => ({
    cardJson: state.card.cardJson
}))(CardPreview);
