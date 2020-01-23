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

import { getTabGroupForDocument } from '../../../../../state/helpers/editorHelpers';
import { RootState } from '../../../../../state/store';
import * as overlay from '../overlay.scss';

import * as styles from './contentOverlay.scss';

interface ContentOverlayProps {
  documentId?: string;
  draggingTab?: boolean;
  appendTab?: (editorKey: string, owningEditor: string, tabId: string) => void;
}

interface ContentOverlayState {
  draggedOver: boolean;
  owningEditor: string;
}

class ContentOverlayComponent extends React.Component<ContentOverlayProps, ContentOverlayState> {
  constructor(props: ContentOverlayProps) {
    super(props);

    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDrop = this.onDrop.bind(this);

    this.state = {
      draggedOver: false,
      owningEditor: getTabGroupForDocument(props.documentId),
    };
  }

  public componentWillReceiveProps(newProps: ContentOverlayProps) {
    const { documentId: newDocumentId } = newProps;
    if (this.props.documentId && this.props.documentId !== newDocumentId) {
      this.setState({ owningEditor: getTabGroupForDocument(newDocumentId) });
    }
  }

  public onDragEnter(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
  }

  public onDragLeave() {
    this.setState({ draggedOver: false });
  }

  public onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ draggedOver: true });
  }

  public onDrop(e: DragEvent<HTMLDivElement>) {
    const tabData = JSON.parse(e.dataTransfer.getData('application/json'));
    if (tabData.editorKey !== this.state.owningEditor) {
      this.props.appendTab(tabData.editorKey, this.state.owningEditor, tabData.tabId);
    }

    this.setState({ draggedOver: false });
    e.preventDefault();
    e.stopPropagation();
  }

  public render() {
    let overlayClassName = this.state.draggedOver ? overlay.draggedOverOverlay : '';
    overlayClassName += this.props.draggingTab ? overlay.enabledForDrop : '';

    return (
      <div
        className={`${overlay.overlay} ${styles.contentOverlay} ${overlayClassName}`}
        onDragEnterCapture={this.onDragEnter}
        onDragLeave={this.onDragLeave}
        onDragOverCapture={this.onDragOver}
        onDropCapture={this.onDrop}
      />
    );
  }
}

const mapStateToProps = (state: RootState): ContentOverlayProps => ({
  draggingTab: state.editor.draggingTab,
});

const mapDispatchToProps = (dispatch): ContentOverlayProps => ({
  appendTab: (editorKey: string, owningEditor: string, tabId: string) =>
    dispatch(EditorActions.appendTab(editorKey, owningEditor, tabId)),
});

export const ContentOverlay = connect(mapStateToProps, mapDispatchToProps)(ContentOverlayComponent) as any;
