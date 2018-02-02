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
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import TabBarTab from './tabBarTab';
import * as Colors from '../../styles/colors';
import * as EditorActions from '../../../data/action/editorActions';

const CSS = css({
    display: 'flex',
    backgroundColor: Colors.EDITOR_TAB_BACKGROUND_DARK,
    boxShadow: '0px 2px 2px 0px rgba(0,0,0,0.2)',
    minHeight: '32px',

    '& > ul': {
        display: 'flex',
        backgroundColor: Colors.EDITOR_TAB_BACKGROUND_DARK,
        listStyleType: 'none',
        margin: 0,
        padding: 0,
        zIndex: 1, // So that the box-shadow will fall onto the document area (sibling div)
        overflowX: 'auto',

        '&::-webkit-scrollbar': {
            height: '2px'
        },

        '&::-webkit-scrollbar-thumb': {
            background: Colors.SCROLLBAR_THUMB_BACKGROUND_DARK
        },

        '&::-webkit-scrollbar-track': {
            background: Colors.SCROLLBAR_TRACK_BACKGROUND_DARK
        }
    },

    '& > div.tab-bar-widgets': {
        display: 'flex',
        alignItems: 'center',
        width: 'auto',
        marginLeft: 'auto',
        flexShrink: 0,

        '& > span': {
            display: 'inline-block',
            cursor: 'pointer',
            height: '16px',
            marginRight: '16px',
            fontSize: '12px',

            '&:first-of-type': {
                marginLeft: '16px'
            }
        },

        '& > .split-widget': {
            '&:after': {
                content: '[ | ]',
                color: Colors.EDITOR_TAB_WIDGET_ENABLED_DARK
            }
        }
    }
});

export class TabBar extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.onSplitClick = this.onSplitClick.bind(this);
    }

    onSplitClick() {
        const owningEditor = this.props.editors[this.props.owningEditor];
        const docIdToSplit = owningEditor.activeDocumentId;
        const docToSplit = owningEditor.documents.find(doc => doc.documentId === docIdToSplit);
        this.props.dispatch(EditorActions.splitTab(docToSplit.contentType, docToSplit.documentId, this.props.owningEditor));
    }

    render() {
        return (
            <div className={ CSS }>
                <ul>
                    {
                        React.Children.map(this.props.children, child =>
                            <li>{ child }</li>
                        )
                    }
                </ul>
                <div className="tab-bar-widgets">
                    { this.props.splitEnabled ? <span className="split-widget" onClick={ this.onSplitClick }></span> : null }
                </div>
            </div>
        );
    }
}

export default connect((state, { owningEditor }) => ({
    activeEditor: state.editor.activeEditor,
    editors: state.editor.editors,
    splitEnabled: state.editor.editors[owningEditor].documents.length > 1
}))(TabBar);

TabBar.propTypes = {
    activeEditor: PropTypes.string,
    editors: PropTypes.object,
    value: PropTypes.number,
    owningEditor: PropTypes.string,
    splitEnabled: PropTypes.bool
};
