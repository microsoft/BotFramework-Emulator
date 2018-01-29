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
import PropTypes from 'prop-types';

import AdaptiveCardOutputMessage from './cardOutputMessage';
import * as CardActions from '../../../data/action/cardActions';
import * as Colors from '../../styles/colors';

const CSS = css({
    width: '100%',
    height: '100%',
    padding: 0,
    paddingTop: 12,
    fontFamily: '\'Segoe UI\', \'Helvetica Neue\', \'Arial\', \'sans-serif\'',
    overflow: 'hidden',

    '& .output-header': {
        paddingLeft: 24,
        fontFamily: '\'Segoe UI Semibold\', \'Helvetica Neue\', \'Arial\', \'sans-serif\'',
        textTransform: 'uppercase',
        backgroundColor: Colors.SECTION_HEADER_BACKGROUND_DARK,
        width: '100%',
        height: 24,
        display: 'flex',
        color: Colors.SECTION_HEADER_FOREGROUND_DARK,

        '& > span': {
            display: 'flex',
            marginLeft: 'auto',
            marginRight: 16,
            cursor: 'pointer'
        }
    },

    '& .output-content': {
        overflow: 'auto',
        height: 'calc(100% - 24px)',
        width: '100%',
        padding: 16,
        userSelect: 'none',
        backgroundColor: Colors.PANEL_BACKGROUND_DARK,
        color: Colors.PANEL_FOREGROUND_DARK
    }
});

class CardOutput extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.clearOutput = this.clearOutput.bind(this);
    }

    // clears the messages in the output window
    clearOutput() {
        this.props.dispatch(CardActions.clearCardOutputWindow(this.props.cardId));
    }

    render() {
        return (
            <div className={ CSS }>
                <span className="output-header">Output <span onClick={ this.clearOutput }>X</span></span>
                <div className="output-content">
                    {
                        this.props.messages && this.props.messages.length ?
                            this.props.messages.map(msg =>
                                <AdaptiveCardOutputMessage key={ msg } message={ msg } />
                            )
                        :
                            <span>Output is empty...</span>
                    }
                </div>
            </div>
        );
    }
}

CardOutput.propTypes = {
    cardId: PropTypes.string,
    messages: PropTypes.arrayOf(PropTypes.string)
};

export default connect((state, { cardId }) => ({
    messages: state.card.cards[cardId].cardOutput
}))(CardOutput);
