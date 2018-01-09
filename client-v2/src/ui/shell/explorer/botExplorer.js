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

import { connect } from 'react-redux';
import { css } from 'glamor';
import React from 'react';

import * as BotActions from '../../../data/action/botActions';
import * as constants from '../../../constants';
import * as EditorActions from '../../../data/action/editorActions';
import ExpandCollapse, { Controls as ExpandCollapseControls, Content as ExpandCollapseContent } from '../../layout/expandCollapse';
import * as Colors from '../../colors/colors';

const CSS = css({
    backgroundColor: Colors.EXPLORER_BACKGROUND_DARK,
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    fontFamily: 'Segoe UI'
});

const BOTS_CSS = css({
    display: 'flex',
    flexDirection: 'column',
    listStyleType: 'none',
    margin: 0,
    padding: '4px 24px',
    color: Colors.EXPLORER_FOREGROUND_DARK
});

class BotExplorer extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.handleAddClick = this.handleAddClick.bind(this);
    }

    handleAddClick(e) {
        const connectAction = BotActions.connect(`http://localhost:${ ~~(Math.random() * 1000) + 4000 }/`);

        this.props.dispatch(connectAction);
        this.props.dispatch(EditorActions.open(constants.ContentType_BotChat, connectAction.payload.botId));
    }

    render() {
        return (
            <ul className={ CSS }>
                <li>
                    <ExpandCollapse
                        initialExpanded={ true }
                        title="Bots"
                    >
                        <ExpandCollapseControls>
                            <button onClick={ this.handleAddClick }>+</button>
                        </ExpandCollapseControls>
                        <ExpandCollapseContent>
                            <ul className={ BOTS_CSS }>
                                {
                                    Object.keys(this.props.bots)
                                        .map(id => ({
                                            id,
                                            url: this.props.bots[id].url
                                        }))
                                        .sort((x, y) => x.url > y.url ? 1 : x.url < y.url ? -1 : 0)
                                        .map(bot => <li key={ bot.id }>{ bot.url }</li>)
                                }
                            </ul>
                        </ExpandCollapseContent>
                    </ExpandCollapse>
                </li>
            </ul>
        );
    }
}

export default connect(state => ({ bots: state.bot.bots }))(BotExplorer)
