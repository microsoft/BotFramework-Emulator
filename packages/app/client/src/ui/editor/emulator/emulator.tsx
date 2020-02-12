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

import { Activity } from 'botframework-schema';
import { DirectLine } from 'botframework-directlinejs';
import { isMac, RestartConversationStatus } from '@bfemulator/app-shared';
import { EmulatorMode } from '@bfemulator/sdk-shared';
import { SplitButton, Splitter } from '@bfemulator/ui-react';
import * as React from 'react';
import { FrameworkSettings, newNotification, Notification, ValueTypesMask } from '@bfemulator/app-shared';

import { Document, SplitterSize } from '../../../state/reducers/editor';
import { debounce } from '../../../utils';

import { ChatPanelContainer } from './chatPanel';
import LogPanel from './logPanel/logPanel';
import PlaybackBar from './playbackBar/playbackBar';
import * as styles from './emulator.scss';
import { InspectorContainer } from './parts';
import { ToolBar } from './toolbar/toolbar';

export const RestartConversationOptions = {
  NewUserId: 'Restart with new user ID',
  SameUserId: 'Restart with same user ID',
};

export interface EmulatorProps {
  activeDocumentId?: string;
  activities?: Activity[];
  botId?: string;
  clearLog?: (documentId: string) => void;
  conversationId?: string;
  createErrorNotification?: (notification: Notification) => void;
  directLine?: DirectLine;
  dirty?: boolean;
  documentId?: string;
  enablePresentationMode?: (enabled: boolean) => void;
  endpointId?: string;
  exportItems?: (types: ValueTypesMask, conversationId: string) => Promise<void>;
  framework?: FrameworkSettings;
  mode?: EmulatorMode;
  presentationModeEnabled?: boolean;
  restartConversation?: (documentId: string, requireNewConversationId: boolean, requireNewUserId: boolean) => void;
  restartDebugSession?: (conversationId: string, documentId: string) => void;
  setInspectorObjects?: (documentId: string, objects: any) => void;
  trackEvent?: (name: string, properties?: { [key: string]: any }) => void;
  ui?: { horizontalSplitter: SplitterSize[]; verticalSplitter: SplitterSize[] };
  updateChat?: (documentId: string, updatedValues: any) => void;
  updateDocument?: (documentId: string, updatedValues: Partial<Document>) => void;
  url?: string;
  userId?: string;
  restartStatus: RestartConversationStatus;
  onStopRestartConversationClick: (documentId: string) => void;
}

export class Emulator extends React.Component<EmulatorProps, {}> {
  private restartButtonRef: HTMLButtonElement;

  private readonly onVerticalSizeChange = debounce((sizes: SplitterSize[]) => {
    this.props.ui = {
      ...this.props.ui,
      verticalSplitter: sizes,
    };
  }, 500);

  private readonly onHorizontalSizeChange = debounce((sizes: SplitterSize[]) => {
    this.props.ui = {
      ...this.props.ui,
      horizontalSplitter: sizes,
    };
  }, 500);

  componentDidMount() {
    if (this.restartButtonRef) {
      this.restartButtonRef.focus();
    }
  }

  componentWillMount() {
    window.addEventListener('keydown', this.keyboardEventListener);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.keyboardEventListener);
  }

  render(): JSX.Element {
    return this.props.presentationModeEnabled ? this.renderPresentationView() : this.renderDefaultView();
  }

  renderPresentationView(): JSX.Element {
    const transcriptMode = this.props.mode === 'transcript';
    const chatPanelChild = transcriptMode ? (
      <div className={styles.presentationPlaybackDock}>
        <PlaybackBar />
      </div>
    ) : null;
    return (
      <div className={styles.presentation}>
        <div className={styles.presentationContent}>
          <ChatPanelContainer mode={this.props.mode} documentId={this.props.documentId} />
          {chatPanelChild}
        </div>
        <span className={styles.closePresentationIcon} onClick={() => this.onPresentationClick(false)} />
      </div>
    );
  }

  renderDefaultView(): JSX.Element {
    const { NewUserId, SameUserId } = RestartConversationOptions;

    const { mode, documentId } = this.props;

    const livechatRender =
      this.props.restartStatus !== RestartConversationStatus.Started ? (
        <>
          <SplitButton
            id={'restart-conversation'}
            defaultLabel="Restart conversation"
            buttonClass={styles.restartIcon}
            options={[NewUserId, SameUserId]}
            onClick={this.onStartOverClick}
            buttonRef={this.setRestartButtonRef}
            submenuLabel={isMac() ? 'Restart conversation sub menu' : ''}
          />
          <button
            role={'menuitem'}
            className={`${styles.saveIcon} ${styles.toolbarIcon || ''}`}
            onClick={this.onExportTranscriptClick}
          >
            Save transcript
          </button>
        </>
      ) : (
        <button
          role={'menuitem'}
          className={`${styles.cancelIcon} ${styles.toolbarIcon || ''}`}
          onClick={() => this.props.onStopRestartConversationClick(documentId)}
        >
          Stop Replaying Conversation
        </button>
      );

    return (
      <div className={styles.emulator}>
        <div className={styles.header}>
          <ToolBar>
            {mode === 'debug' && (
              <button
                className={`${styles.restartIcon} ${styles.toolbarIcon || ''}`}
                onClick={this.onReconnectToDebugBotClick}
              >
                Reconnect
              </button>
            )}
            {mode === 'livechat' && livechatRender}
          </ToolBar>
        </div>
        <div key={this.getConversationId()} className={`${styles.content} ${styles.vertical}`}>
          <Splitter
            orientation="vertical"
            primaryPaneIndex={0}
            minSizes={{ 0: 200, 1: 80 }}
            initialSizes={this.getVerticalSplitterSizes}
            onSizeChange={this.onVerticalSizeChange}
          >
            <div className={styles.content}>
              <ChatPanelContainer
                mode={mode}
                className={styles.chatPanel}
                documentId={documentId}
                onStartConversation={this.onStartOverClick}
              />
            </div>
            <div className={styles.content}>
              <Splitter
                orientation="horizontal"
                primaryPaneIndex={0}
                minSizes={{ 0: 80, 1: 80 }}
                initialSizes={this.getHorizontalSplitterSizes}
                onSizeChange={this.onHorizontalSizeChange}
              >
                <InspectorContainer documentId={documentId} />
                <LogPanel documentId={documentId} />
              </Splitter>
            </div>
          </Splitter>
        </div>
      </div>
    );
  }

  private getVerticalSplitterSizes = (): { [0]: string } => {
    return {
      0: '' + this.props.ui.verticalSplitter[0].percentage,
    };
  };

  private getHorizontalSplitterSizes = (): { [0]: string } => {
    return {
      0: '' + this.props.ui.horizontalSplitter[0].percentage,
    };
  };

  private getConversationId() {
    return this.props.conversationId || 'default-conversation';
  }

  private onPresentationClick = (enabled: boolean): void => {
    this.props.enablePresentationMode(enabled);
  };

  private onStartOverClick = (option: string = RestartConversationOptions.NewUserId): void => {
    const { NewUserId, SameUserId } = RestartConversationOptions;
    const { documentId } = this.props;

    switch (option) {
      case NewUserId: {
        this.props.trackEvent('conversation_restart', {
          userId: 'new',
        });
        // start conversation with new convo id & user id
        this.props.restartConversation(documentId, true, true);
        break;
      }

      case SameUserId: {
        this.props.trackEvent('conversation_restart', {
          userId: 'same',
        });
        // start conversation with new convo id
        this.props.restartConversation(documentId, true, false);
        break;
      }

      default:
        break;
    }
  };
  // Uncomment when ready to export bot state
  // private onExportBotStateClick = async (): Promise<void> => {
  //   try {
  //     await this.props.exportItems(ValueTypesMask.BotState, this.props.conversationId);
  //   } catch (e) {
  //     const notification = newNotification(e.message);
  //     this.props.createErrorNotification(notification);
  //   }
  // };

  private onExportTranscriptClick = async (): Promise<void> => {
    try {
      await this.props.exportItems(ValueTypesMask.Activity, this.props.conversationId);
    } catch (e) {
      const notification = newNotification(e.message);
      this.props.createErrorNotification(notification);
    }
  };

  private onReconnectToDebugBotClick = () => {
    const { documentId } = this.props;
    this.props.restartConversation(documentId, true, false);
  };

  private setRestartButtonRef = (ref: HTMLButtonElement): void => {
    this.restartButtonRef = ref;
  };

  private readonly keyboardEventListener: EventListener = (event: KeyboardEvent): void => {
    if (this.props.activeDocumentId === this.props.documentId) {
      // Meta corresponds to 'Command' on Mac
      const ctrlOrCmdPressed = event.getModifierState('Control') || event.getModifierState('Meta');
      const shiftPressed = ctrlOrCmdPressed && event.getModifierState('Shift');
      const key = event.key.toLowerCase();
      if (ctrlOrCmdPressed && shiftPressed && key === 'r') {
        this.onStartOverClick();
      }
    }
  };
}
