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

import * as React from 'react';
import { connect } from 'react-redux';
import { css } from 'glamor';

import { OVERLAY_CSS } from './overlayStyle';
import * as Constants from '../../../../constants';
import { IRootState } from '../../../../data/store';

const CSS = css({
  top: 0,
  left: 0,
  right: '80%',
  bottom: 0
}, OVERLAY_CSS);

interface LeftContentOverlayProps {
  documentId?: string;
  draggingTab?: boolean;
}

interface LeftContentOverlayState {
  draggedOver: boolean;
}

class LeftContentOverlayComponent extends React.Component<LeftContentOverlayProps, LeftContentOverlayState> {
  constructor(props: LeftContentOverlayProps) {
    super(props);

    this.state = {
      draggedOver: false
    };
  }

  private onDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  }

  private onDragLeave = (e) => {
    this.setState(({ draggedOver: false }));
  }

  private onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState(({ draggedOver: true }));
  }

  private onDrop = (e) => {
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

const mapStateToProps = (state: IRootState): LeftContentOverlayProps => ({
  draggingTab: state.editor.draggingTab
});

export const LeftContentOverlay = connect(mapStateToProps)(LeftContentOverlayComponent);
