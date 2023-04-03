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

import { TruncateText } from '@bfemulator/ui-react';
import * as React from 'react';
import { DragEvent, KeyboardEvent, SyntheticEvent } from 'react';
import { isLinux } from '@bfemulator/app-shared';

import { getTabGroupForDocument } from '../../../../state/helpers/editorHelpers';
import { DOCUMENT_ID_APP_SETTINGS, DOCUMENT_ID_MARKDOWN_PAGE, DOCUMENT_ID_WELCOME_PAGE } from '../../../../constants';

import * as styles from './tab.scss';

export interface TabProps {
  index: number;
  active?: boolean;
  dirty?: boolean;
  documentId?: string;
  label?: string;
  toggleDraggingTab?: (toggle: boolean) => any;
  onCloseClick?: (documentId: string) => any;
  swapTabs?: (editorKey: string, owningEditor: string, tabId: string) => any;
  hideIcon?: boolean;
}

export interface TabState {
  draggedOver: boolean;
  owningEditor: string;
}

export class Tab extends React.Component<TabProps, TabState> {
  private tabRef: HTMLButtonElement;
  constructor(props: TabProps) {
    super(props);

    this.state = {
      draggedOver: false,
      owningEditor: getTabGroupForDocument(props.documentId),
    };
  }

  componentDidMount() {
    if (this.tabRef) {
      this.tabRef.focus();
    }
  }

  public render() {
    const { active, label, index } = this.props;
    const activeClassName = active ? styles.activeEditorTab : '';
    const draggedOverClassName = this.state.draggedOver ? styles.draggedOverEditorTab : '';
    const iconClass = this.iconClass;

    return (
      <div
        className={`${styles.tab} ${activeClassName} ${draggedOverClassName}`}
        draggable={true}
        onDragOver={this.onDragOver}
        onDragEnter={this.onDragEnter}
        onDragStart={this.onDragStart}
        onDrop={this.onDrop}
        onDragLeave={this.onDragLeave}
        onDragEnd={this.onDragEnd}
        role="presentation"
      >
        {this.props.children}
        {!this.props.hideIcon && <span className={`${styles.editorTabIcon} ${iconClass}`} role="presentation" />}
        <TruncateText className={styles.truncatedTabText}>{label}</TruncateText>
        {this.props.dirty ? <span role="presentation">*</span> : null}
        <div className={styles.tabSeparator} role="presentation" />
        <div
          className={styles.tabFocusTarget}
          role="tab"
          tabIndex={0}
          aria-label={`${label}. Tab ${index}`}
          aria-selected={active}
          aria-description={isLinux() && active ? 'selected' : undefined}
          ref={this.setTabRef}
        >
          &nbsp;
        </div>
        <button
          type="button"
          title={`Close ${label} tab. Tab ${index}`}
          className={styles.editorTabClose}
          onKeyPress={this.onCloseButtonKeyPress}
          onClick={this.onCloseClick}
        >
          <span />
        </button>
      </div>
    );
  }

  private onCloseButtonKeyPress = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === ' ' || event.keyCode === 13) {
      this.props.onCloseClick(this.props.documentId);
    }
  };

  private onCloseClick = (event: SyntheticEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    this.props.onCloseClick(this.props.documentId);
  };

  private onDragStart = e => {
    const dragData = {
      tabId: this.props.documentId,
      editorKey: this.state.owningEditor,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    this.props.toggleDraggingTab(true);
  };

  private onDragEnd = () => {
    this.props.toggleDraggingTab(false);
  };

  private onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ draggedOver: true });
  };

  private onDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  private onDragLeave = () => {
    this.setState({ draggedOver: false });
  };

  private onDrop = (e: DragEvent<HTMLDivElement>) => {
    const tabData = JSON.parse(e.dataTransfer.getData('application/json'));

    // only swap the tabs if they are different
    if (tabData.tabId !== this.props.documentId) {
      this.props.swapTabs(tabData.editorKey, this.state.owningEditor, tabData.tabId);
    }

    this.setState({ draggedOver: false });
    e.preventDefault();
    e.stopPropagation();
  };

  private get iconClass(): string {
    switch (this.props.documentId) {
      case DOCUMENT_ID_WELCOME_PAGE:
      // Falls through

      case DOCUMENT_ID_MARKDOWN_PAGE:
        return styles.generic;

      case DOCUMENT_ID_APP_SETTINGS:
        return styles.settings;

      default:
        return styles.livechat;
    }
  }

  private setTabRef = (ref: HTMLButtonElement): void => {
    this.tabRef = ref;
  };
}
