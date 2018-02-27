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

import * as EditorActions from '../../../../data/action/editorActions';
import * as Colors from '../../../styles/colors';
import ContentOverlay from './contentOverlay';
import LeftContentOverlay from './leftContentOverlay';
import RightContentOverlay from './rightContentOverlay';
import * as Constants from '../../../../constants';
import InsetShadow from '../../../layout/insetShadow';

const CSS = css({
    position: 'relative',
    height: '100%',
    width: '100%'
});

export class TabbedDocumentContentWrapper extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.onClick = this.onClick.bind(this);
    }

    onClick(e) {
        if (this.props.owningEditor !== this.props.activeEditor) {
            this.props.dispatch(EditorActions.setActiveEditor(this.props.owningEditor));
        }
    }

    render() {
        const onlyOneEditorActive = this.props.primaryEditor && !this.props.secondaryEditor;
        const splittingEnabled = onlyOneEditorActive && this.props.primaryEditor.documents && this.props.primaryEditor.documents.length > 1;

        return (
            <div className={ CSS } onClickCapture={ this.onClick }>
                { this.props.children }
                <ContentOverlay owningEditor={ this.props.owningEditor } />
                {
                    splittingEnabled ?
                        <React.Fragment>
                            <LeftContentOverlay />
                            <RightContentOverlay />
                        </React.Fragment>
                    :
                        null
                }
                <InsetShadow top={ true } />
            </div>
        );
    }
}

export default connect((state, ownProps) => ({
    activeEditor: state.editor.activeEditor,
    primaryEditor: state.editor.editors[Constants.EditorKey_Primary],
    secondaryEditor: state.editor.editors[Constants.EditorKey_Secondary]
}))(TabbedDocumentContentWrapper);

TabbedDocumentContentWrapper.propTypes = {
    activeEditor: PropTypes.oneOf([
        Constants.EditorKey_Primary,
        Constants.EditorKey_Secondary
    ]),
    owningEditor: PropTypes.oneOf([
        Constants.EditorKey_Primary,
        Constants.EditorKey_Secondary
    ]),
    primaryEditor: PropTypes.object,
    secondaryEditor: PropTypes.object
};
