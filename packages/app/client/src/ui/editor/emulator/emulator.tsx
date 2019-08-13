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

import { createDirectLine } from 'botframework-webchat';
import { DirectLine } from 'botframework-directlinejs';
import { CommandServiceImpl, CommandServiceInstance, EmulatorMode, uniqueId, uniqueIdv4 } from '@bfemulator/sdk-shared';
import { SplitButton, Splitter } from '@bfemulator/ui-react';
import base64Url from 'base64url';
import * as React from 'react';
import {
  FrameworkSettings,
  newNotification,
  Notification,
  SharedConstants,
  ValueTypesMask,
} from '@bfemulator/app-shared';

import { Document, SplitterSize } from '../../../state/reducers/editor';
import { debounce } from '../../../utils';
import { ChatDocument } from '../../../state/reducers/chat';

import ChatPanel from './chatPanel/chatPanel';
import LogPanel from './logPanel/logPanel';
import PlaybackBar from './playbackBar/playbackBar';
import * as styles from './emulator.scss';
import { InspectorContainer } from './parts';
import { ToolBar } from './toolbar/toolbar';

const { encode } = base64Url;

export const RestartConversationOptions = {
  NewUserId: 'Restart with new user ID',
  SameUserId: 'Restart with same user ID',
};

export interface EmulatorProps {
  activeDocumentId?: string;
  clearLog?: (documentId: string) => Promise<void>;
  conversationId?: string;
  createErrorNotification?: (notification: Notification) => void;
  directLine?: DirectLine;
  dirty?: boolean;
  document?: Document;
  documentId?: string;
  enablePresentationMode?: (enabled: boolean) => void;
  endpointId?: string;
  exportItems?: (types: ValueTypesMask, conversationId: string) => Promise<void>;
  framework?: FrameworkSettings;
  mode?: EmulatorMode;
  newConversation?: (documentId: string, options: any) => void;
  presentationModeEnabled?: boolean;
  restartDebugSession?: (conversationId: string, documentId: string) => void;
  setInspectorObjects?: (documentId: string, objects: any) => void;
  trackEvent?: (name: string, properties?: { [key: string]: any }) => void;
  updateChat?: (documentId: string, updatedValues: any) => void;
  updateDocument?: (documentId: string, updatedValues: Partial<Document>) => void;
  url?: string;
}

export class Emulator extends React.Component<EmulatorProps, {}> {
  @CommandServiceInstance()
  private commandService: CommandServiceImpl;
  private conversationInitRequested: boolean;

  private readonly onVerticalSizeChange = debounce((sizes: SplitterSize[]) => {
    this.props.document.ui = {
      ...this.props.document.ui,
      verticalSplitter: sizes,
    };
  }, 500);

  private readonly onHorizontalSizeChange = debounce((sizes: SplitterSize[]) => {
    this.props.document.ui = {
      ...this.props.document.ui,
      horizontalSplitter: sizes,
    };
  }, 500);

  shouldStartNewConversation(props: EmulatorProps = this.props): boolean {
    return !props.directLine || props.document.conversationId !== (props.directLine as any).conversationId;
  }

  componentWillMount() {
    window.addEventListener('keydown', this.keyboardEventListener);
    if (this.shouldStartNewConversation()) {
      this.startNewConversation();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.keyboardEventListener);
  }

  componentWillReceiveProps(nextProps: EmulatorProps) {
    const { props, keyboardEventListener, startNewConversation } = this;
    const { document = {} as Document } = props;
    const { directLine, document: nextDocument = {} as Document } = nextProps;

    const documentIdChanged = !directLine || document.documentId !== nextDocument.documentId;

    if (documentIdChanged) {
      startNewConversation(nextProps).catch();
    }
    const switchedDocuments = props.activeDocumentId !== nextProps.activeDocumentId;
    const switchedToThisDocument = nextProps.activeDocumentId === props.documentId;

    if (switchedDocuments) {
      if (switchedToThisDocument) {
        window.addEventListener('keydown', keyboardEventListener);
      } else {
        window.removeEventListener('keydown', keyboardEventListener);
      }
    }
  }

  startNewConversation = async (
    props: EmulatorProps = this.props,
    requireNewConvoId: boolean = false,
    requireNewUserId: boolean = false
  ): Promise<any> => {
    if (this.conversationInitRequested) {
      return;
    }
    this.conversationInitRequested = true;

    // Look for an existing conversation ID and use that,
    // otherwise, create a new one
    const conversationId = requireNewConvoId
      ? `${uniqueId()}|${props.mode}`
      : props.document.conversationId || `${uniqueId()}|${props.mode}`;

    let userId;
    if (requireNewUserId) {
      userId = uniqueIdv4();
    } else {
      // use the previous id, or custom id
      const { framework = {} } = this.props;
      userId = props.document.userId || framework.userGUID;
    }
    await this.commandService.remoteCall(SharedConstants.Commands.Emulator.SetCurrentUser, userId);

    const options = {
      conversationId,
      mode: props.mode,
      endpointId: props.endpointId,
      userId,
    };

    this.initConversation(props, options);

    if (props.mode === 'transcript') {
      try {
        const conversation = await this.commandService.remoteCall<any>(
          SharedConstants.Commands.Emulator.NewTranscript,
          conversationId
        );

        if (props.document && props.document.inMemory && props.document.activities) {
          try {
            // transcript was deep linked via protocol or is generated in-memory via chatdown,
            // and should just be fed its own activities attached to the document
            await this.commandService.remoteCall<any>(
              SharedConstants.Commands.Emulator.FeedTranscriptFromMemory,
              conversation.conversationId,
              props.document.botId,
              props.document.userId,
              props.document.activities
            );
          } catch (err) {
            throw new Error(`Error while feeding deep-linked transcript to conversation: ${err}`);
          }
        } else {
          try {
            // the transcript is on disk, so its activities need to be read on the main side and fed in
            const fileInfo: {
              fileName: string;
              filePath: string;
            } = await this.commandService.remoteCall<any>(
              SharedConstants.Commands.Emulator.FeedTranscriptFromDisk,
              conversation.conversationId,
              props.document.botId,
              props.document.userId,
              props.document.documentId
            );

            this.props.updateDocument(props.documentId, fileInfo);
          } catch (err) {
            throw new Error(`Error while feeding transcript on disk to conversation: ${err}`);
          }
        }
      } catch (err) {
        const errMsg = `Error creating a new conversation in transcript mode: ${err}`;
        const notification = newNotification(errMsg);
        this.props.createErrorNotification(notification);
      }
    }
    this.conversationInitRequested = false;
  };

  initConversation(props: EmulatorProps, options: any): void {
    const encodedOptions = encode(JSON.stringify(options));

    // TODO: We need to use encoded token because we need to pass both endpoint ID and conversation ID
    //       We should think about a better model to pass conversation ID from Web Chat to emulator core
    const directLine = createDirectLine({
      secret: encodedOptions,
      domain: `${this.props.url}/v3/directline`,
      webSocket: false,
    });

    this.props.newConversation(props.documentId, {
      conversationId: options.conversationId,
      // webChatStore,
      directLine,
      userId: options.userId,
      mode: options.mode,
    });
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
          <ChatPanel mode={this.props.mode} document={this.props.document as ChatDocument} />
          {chatPanelChild}
        </div>
        <span className={styles.closePresentationIcon} onClick={() => this.onPresentationClick(false)} />
      </div>
    );
  }

  renderDefaultView(): JSX.Element {
    const { NewUserId, SameUserId } = RestartConversationOptions;

    const { mode, document } = this.props;
    return (
      <div className={styles.emulator} key={this.getConversationId()}>
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
            {mode === 'livechat' && (
              <>
                <SplitButton
                  defaultLabel="Restart conversation"
                  buttonClass={styles.restartIcon}
                  options={[NewUserId, SameUserId]}
                  onClick={this.onStartOverClick}
                />
                <button
                  className={`${styles.saveIcon} ${styles.toolbarIcon || ''}`}
                  onClick={this.onExportTranscriptClick}
                >
                  Save transcript
                </button>
              </>
            )}
          </ToolBar>
        </div>
        <div className={`${styles.content} ${styles.vertical}`}>
          <Splitter
            orientation="vertical"
            primaryPaneIndex={0}
            minSizes={{ 0: 200, 1: 80 }}
            initialSizes={this.getVerticalSplitterSizes}
            onSizeChange={this.onVerticalSizeChange}
          >
            <div className={styles.content}>
              <ChatPanel
                mode={mode}
                className={styles.chatPanel}
                document={document as ChatDocument}
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
                <InspectorContainer document={document} />
                <LogPanel document={document} />
              </Splitter>
            </div>
          </Splitter>
        </div>
      </div>
    );
  }

  private getVerticalSplitterSizes = (): { [0]: string } => {
    return {
      0: '' + this.props.document.ui.verticalSplitter[0].percentage,
    };
  };

  private getHorizontalSplitterSizes = (): { [0]: string } => {
    return {
      0: '' + this.props.document.ui.horizontalSplitter[0].percentage,
    };
  };

  private getConversationId() {
    const { document } = this.props;

    if (document && document.conversationId) {
      return document.conversationId;
    }

    return 'default-conversation';
  }

  private onPresentationClick = (enabled: boolean): void => {
    this.props.enablePresentationMode(enabled);
  };

  private onStartOverClick = async (option: string = RestartConversationOptions.NewUserId): Promise<void> => {
    const { NewUserId, SameUserId } = RestartConversationOptions;
    this.props.setInspectorObjects(this.props.document.documentId, []);
    if (this.props.document.directLine) {
      this.props.document.directLine.end();
    }
    await this.props.clearLog(this.props.document.documentId);

    switch (option) {
      case NewUserId: {
        this.props.trackEvent('conversation_restart', {
          userId: 'new',
        });
        // start conversation with new convo id & user id
        await this.startNewConversation(undefined, true, true);
        break;
      }

      case SameUserId: {
        this.props.trackEvent('conversation_restart', {
          userId: 'same',
        });
        // start conversation with new convo id
        await this.startNewConversation(undefined, true, false);
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
    const { conversationId, document } = this.props;
    this.props.restartDebugSession(conversationId, document.documentId);
  };

  private readonly keyboardEventListener: EventListener = async (event: KeyboardEvent): Promise<void> => {
    // Meta corresponds to 'Command' on Mac
    const ctrlOrCmdPressed = event.getModifierState('Control') || event.getModifierState('Meta');
    const shiftPressed = ctrlOrCmdPressed && event.getModifierState('Shift');
    const key = event.key.toLowerCase();
    if (ctrlOrCmdPressed && shiftPressed && key === 'r') {
      await this.onStartOverClick();
    }
  };
}
