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

import React from 'react';
import { connect } from 'react-redux';
import { css } from 'glamor';
import PropTypes from 'prop-types';

import { OVERLAY_CSS } from './overlayStyle';
import * as EditorActions from '../../../../data/action/editorActions';
import * as Constants from '../../../../constants';

const CSS = css({
    top: 0,
    left: '80%',
    right: 0,
    bottom: 0
}, OVERLAY_CSS);

export class RightContentOverlay extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.onDragEnter = this.onDragEnter.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);
        this.onDragOver = this.onDragOver.bind(this);
        this.onDrop = this.onDrop.bind(this);

        this.state = {};
    }

    onDragEnter(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    onDragLeave(e) {
        this.setState(({ draggedOver: false }));
    }

    onDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        this.setState(({ draggedOver: true }));
    }

    onDrop(e) {
        const tabData = JSON.parse(e.dataTransfer.getData('application/json'));
        const tabId = tabData.tabId;
        const docToSplit = this.props.primaryEditor.documents[tabId];
        this.props.dispatch(EditorActions.splitTab(docToSplit.contentType, tabId, Constants.EditorKey_Primary, Constants.EditorKey_Secondary));
        this.setState(({ draggedOver: false }));

        e.preventDefault();
        e.stopPropagation();
    }

    render() {
        let overlayClassName = this.state.draggedOver ? ' dragged-over-overlay' : '';
        overlayClassName += (this.props.draggingTab ? ' enabled-for-drop' : '');

        return (
            <div className={ CSS + overlayClassName }
                onDragEnterCapture={ this.onDragEnter } onDragLeave={ this.onDragLeave }
                onDragOverCapture={ this.onDragOver } onDropCapture={ this.onDrop } />
        );
    }
}

export default connect((state, ownProps) => ({
    draggingTab: state.editor.draggingTab,
    primaryEditor: state.editor.editors[Constants.EditorKey_Primary]
}))(RightContentOverlay);

RightContentOverlay.propTypes = {
    draggingTab: PropTypes.bool,
    primaryEditor: PropTypes.object
};
