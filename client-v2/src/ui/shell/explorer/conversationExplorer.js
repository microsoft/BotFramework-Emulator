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
import { connect } from 'react-redux';

import { uniqueId } from '../../../utils';
import * as constants from '../../../constants';
import * as ConversationActions from '../../../data/action/conversationActions';
import * as EditorActions from '../../../data/action/editorActions';
import ExpandCollapse, { Controls as ExpandCollapseControls, Content as ExpandCollapseContent } from '../../layout/expandCollapse';
import conversation from '../../../data/reducer/conversation';
import * as Colors from '../../colors/colors';

const CSS = css({
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    backgroundColor: Colors.EXPLORER_BACKGROUND_DARK,
    color: Colors.EXPLORER_FOREGROUND_DARK
});

const BOTS_CSS = css({
    display: 'flex',
    flexDirection: 'column',
    listStyleType: 'none',
    margin: 0,
    padding: 0,

    '& > li': {
        padding: '4px 24px',
        fontFamily: '\'Segoe UI\', \'Helvetica Neue\', \'Arial\', \'sans-serif\''
    }
});

class ConversationExplorer extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.handleAddClick = this.handleAddClick.bind(this);
    }

    handleAddClick(e) {
        e.stopPropagation();

        const createAction = ConversationActions.create();

        this.props.dispatch(createAction);

        // TODO: Turn this into a saga, the conversation ID maybe generated from server asynchronously
        this.props.dispatch(EditorActions.open(
            constants.ContentType_Conversation,
            createAction.payload.conversationId
        ));
    }

    render() {
        return (
            <ul className={ CSS }>
                <li>
                    <ExpandCollapse
                        initialExpanded={ true }
                        title="Conversations"
                    >
                        <ExpandCollapseControls>
                            <button onClick={ this.handleAddClick }>+</button>
                        </ExpandCollapseControls>
                        <ExpandCollapseContent>
                            <ul className={ BOTS_CSS }>
                            {
                                Object.keys(this.props.conversations).map(conversationId =>
                                    <li key={ conversationId }>
                                        { this.props.conversations[conversationId].name }
                                    </li>
                                )
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
    conversations: state.conversation.conversations
}))(ConversationExplorer)
