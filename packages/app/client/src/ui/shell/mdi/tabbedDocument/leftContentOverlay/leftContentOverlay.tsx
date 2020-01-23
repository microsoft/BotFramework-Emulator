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
import { DragEvent } from 'react';
import { connect } from 'react-redux';
import * as EditorActions from '@bfemulator/app-shared/built/state/actions/editorActions';

import { RootState } from '../../../../../state/store';
import * as overlay from '../overlay.scss';

import * as styles from './leftContentOverlay.scss';

interface LeftContentOverlayProps {
  documentId?: string;
  draggingTab?: boolean;
  handleTabDrop?: (tabId: string) => void;
}

interface LeftContentOverlayState {
  draggedOver: boolean;
}

class LeftContentOverlayComponent extends React.Component<LeftContentOverlayProps, LeftContentOverlayState> {
  public state = {
    draggedOver: false,
  };

  public render() {
    let overlayClassName = this.state.draggedOver ? overlay.draggedOverOverlay : '';
    overlayClassName += this.props.draggingTab ? overlay.enabledForDrop : '';

    return (
      <div
        className={`${overlay.overlay} ${styles.leftContentOverlay} ${overlayClassName}`}
        onDragEnterCapture={this.onDragEnter}
        onDragLeave={this.onDragLeave}
        onDragOverCapture={this.onDragOver}
        onDropCapture={this.onDrop}
      />
    );
  }

  private onDragEnter = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  private onDragLeave = (_e: DragEvent<HTMLDivElement>) => {
    this.setState({ draggedOver: false });
  };

  private onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ draggedOver: true });
  };

  private onDrop = (e: DragEvent<HTMLDivElement>) => {
    const tabData = JSON.parse(e.dataTransfer.getData('application/json'));
    const tabId = tabData.tabId;
    this.props.handleTabDrop(tabId);
    this.setState({ draggedOver: false });
    e.preventDefault();
    e.stopPropagation();
  };
}

const mapStateToProps = (state: RootState): LeftContentOverlayProps => ({
  draggingTab: state.editor.draggingTab,
});

const mapDispatchToProps = (dispatch): LeftContentOverlayProps => ({
  handleTabDrop: (tabId: string) => {
    dispatch(EditorActions.dropTabOnLeftOverlay(tabId));
  },
});

export const LeftContentOverlay = connect(mapStateToProps, mapDispatchToProps)(LeftContentOverlayComponent);
