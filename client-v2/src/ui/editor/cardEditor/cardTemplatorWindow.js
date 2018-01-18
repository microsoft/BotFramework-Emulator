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

import CardTemplateRow from './cardTemplateRow';
import * as Colors from '../../colors/colors';

const CSS = css({
    width: '100%',
    height: '100%',
    padding: '12px 0',
    overflow: 'auto',
    fontFamily: '\'Segoe UI\', \'Helvetica Neue\', \'Arial\', \'sans-serif\'',

    ' .template-header': {
        paddingLeft: 24,
        fontFamily: '\'Segoe UI Semibold\', \'Helvetica Neue\', \'Arial\', \'sans-serif\'',
        textTransform: 'uppercase',
        backgroundColor: Colors.SECTION_HEADER_BACKGROUND_DARK,
        height: 24,
        width: '100%',
        display: 'block',
        color: Colors.SECTION_HEADER_FOREGROUND_DARK,
    },

    ' .template-content': {
        overflow: 'auto',
        height: 'calc(100% - 24px)',
        width: '100%',
        padding: 16,
        backgroundColor: Colors.PANEL_BACKGROUND_DARK,
        color: Colors.PANEL_FOREGROUND_DARK
    }
});

class CardTemplator extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return (
            <div className={ CSS }>
                <span className="template-header">Template Editor</span>
                <div className="template-content">
                    {
                        this.props.length ?
                            this.props.entities.map(ent => <CardTemplateRow key={ ent } entityName={ ent } />)
                        :
                            <span>No template entities...</span>
                    }
                </div>
            </div>
        );
    }
}

CardTemplator.propTypes = {
    cardId: PropTypes.string,
    entities: PropTypes.array
};

export default connect((state, { cardId }) => ({
    entities: state.card.cards[cardId].entities
}))(CardTemplator);
