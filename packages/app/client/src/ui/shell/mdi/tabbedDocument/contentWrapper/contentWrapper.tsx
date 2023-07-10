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
import { Component } from 'react';
import { connect } from 'react-redux';
import { setActiveEditor, tabGroupHasDocuments, Editor, SharedConstants } from '@bfemulator/app-shared';

import { RootState } from '../../../../../state/store';
import { getTabGroupForDocument } from '../../../../../state/helpers';
import { ContentOverlay, LeftContentOverlay, RightContentOverlay } from '../index';

import * as styles from './contentWrapper.scss';

interface TabbedDocumentContentProps {
  activeEditor?: string;
  documentId?: string;
  hidden?: boolean;
  primaryEditor?: Editor;
  secondaryEditor?: Editor;
  setActiveEditor?: (editor: string) => void;
}

interface TabbedDocumentContentState {
  owningEditor: string;
}

class TabbedDocumentContentWrapperComponent extends Component<TabbedDocumentContentProps, TabbedDocumentContentState> {
  contentRef = React.createRef<HTMLDivElement>();

  constructor(props: TabbedDocumentContentProps) {
    super(props);

    this.state = {
      owningEditor: getTabGroupForDocument(props.documentId),
    };
  }

  public render() {
    const onlyOneEditorActive =
      tabGroupHasDocuments(this.props.primaryEditor) && !tabGroupHasDocuments(this.props.secondaryEditor);

    const splittingEnabled =
      onlyOneEditorActive &&
      this.props.primaryEditor.documents &&
      Object.keys(this.props.primaryEditor.documents).length > 1;

    return (
      <div
        className={styles.contentWrapper}
        hidden={this.props.hidden}
        aria-hidden={this.props.hidden}
        onClickCapture={this.onClick}
        ref={this.contentRef}
      >
        {this.props.children}
        <ContentOverlay documentId={this.props.documentId} />
        {splittingEnabled ? (
          <>
            <LeftContentOverlay />
            <RightContentOverlay />
          </>
        ) : null}
      </div>
    );
  }

  public componentWillReceiveProps(newProps: TabbedDocumentContentProps) {
    const { documentId: newDocumentId } = newProps;
    if (this.props.documentId && this.props.documentId !== newDocumentId) {
      this.setState({ owningEditor: getTabGroupForDocument(newDocumentId) });
    }
  }

  public componentDidUpdate(prevProps: Readonly<TabbedDocumentContentProps>): void {
    if (!this.props.hidden && prevProps.hidden && this.contentRef.current) {
      (this.contentRef.current.querySelector(
        'input, button:not([role="link"]), textarea, [tab-index]'
      ) as HTMLElement | null)?.focus();
    }
  }

  private onClick = () => {
    if (this.state.owningEditor !== this.props.activeEditor) {
      this.props.setActiveEditor(this.state.owningEditor);
    }
  };
}

const mapStateToProps = (state: RootState): TabbedDocumentContentProps => ({
  activeEditor: state.editor.activeEditor,
  primaryEditor: state.editor.editors[SharedConstants.EDITOR_KEY_PRIMARY],
  secondaryEditor: state.editor.editors[SharedConstants.EDITOR_KEY_SECONDARY],
});

const mapDispatchToProps = (dispatch): TabbedDocumentContentProps => ({
  setActiveEditor: (editor: string) => dispatch(setActiveEditor(editor)),
});

export const TabbedDocumentContentWrapper = connect(
  mapStateToProps,
  mapDispatchToProps
)(TabbedDocumentContentWrapperComponent) as any;
