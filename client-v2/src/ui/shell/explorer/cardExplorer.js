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

import { css } from 'glamor';
import React from 'react';
import * as constants from '../../../constants';
import { connect } from 'react-redux';
import ExpandCollapse, { Controls as ExpandCollapseControls, Content as ExpandCollapseContent } from '../../layout/expandCollapse';
import { directoryExists, getFilesInDir, fileExists, readFileSync } from '../../utils';
import * as CardActions from '../../../data/action/cardActions';
import { uniqueId } from '../../../utils';
import { ContentType_Card } from '../../../constants';

const CSS = css({
    backgroundColor: 'Pink',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    listStyleType: 'none',
    margin: 0,
    padding: 0
});

const BOTS_CSS = css({
    display: 'flex',
    flexDirection: 'column',
    listStyleType: 'none',
    margin: 0,
    padding: 0
});

export class CardExplorer extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.handleCardClick = this.handleCardClick.bind(this);
    }

    componentWillMount() {
        // look at the current folder and check for cards under it
        const cardsPath = this.props.folder + "/cards";
        if (directoryExists(cardsPath)) {
            const files = getFilesInDir(cardsPath);

            const jsonFileRegex = /.json$/;
            for(let i = 0; i < files.length; i++) {
                const file = files[i];
                const filePath = cardsPath + "/" + file;

                if (fileExists(filePath) && jsonFileRegex.test(file)) {
                    const cardContent = {
                        title: file,
                        cardJson: readFileSync(filePath) || "{}",
                        cardOutput: [],
                        entities: [],
                        path: filePath,
                        contentType: ContentType_Card
                    };

                    this.props.dispatch(CardActions.createCard(uniqueId(), cardContent));
                }
            }
        }
    }

    handleCardClick(title) {
        console.log("Clicked card: ", title);
    }

    render() {
        return(
            <ul className={ CSS }>
                <li>
                    <ExpandCollapse
                        initialExpanded={ true }
                        title="Cards"
                    >
                        <ExpandCollapseContent>
                            <ul className={ BOTS_CSS }>
                                {
                                    Object.keys(this.props.cards).length ?
                                        Object.keys(this.props.cards).map(id =>
                                            <li onClick={ () => this.handleCardClick(card.title) } key={ id }>{ this.props.cards[id].title }</li>
                                        )
                                    :
                                        <li>No cards found...</li>
                                }
                            </ul>
                        </ExpandCollapseContent>
                    </ExpandCollapse>
                </li>
            </ul>
        );
    }
}

export default connect(state => ({
    cards: state.card.cards
}))(CardExplorer);
