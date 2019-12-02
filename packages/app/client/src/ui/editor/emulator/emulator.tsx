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
import { isMac } from '../../../../../main/src/utils/platform';

import { ChatPanelContainer } from './chatPanel';
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
  activities?: Activity[];
  botId?: string;
  clearLog?: (documentId: string) => Promise<void>;
  conversationId?: string;
  createErrorNotification?: (notification: Notification) => void;
  directLine?: DirectLine;
  dirty?: boolean;
  documentId?: string;
  enablePresentationMode?: (enabled: boolean) => void;
  endpointId?: string;
  exportItems?: (types: ValueTypesMask, conversationId: string) => Promise<void>;
  framework?: FrameworkSettings;
  inMemory?: boolean;
  mode?: EmulatorMode;
  newConversation?: (documentId: string, options: any) => void;
  presentationModeEnabled?: boolean;
  restartDebugSession?: (conversationId: string, documentId: string) => void;
  setInspectorObjects?: (documentId: string, objects: any) => void;
  trackEvent?: (name: string, properties?: { [key: string]: any }) => void;
  ui?: { horizontalSplitter: SplitterSize[]; verticalSplitter: SplitterSize[] };
  updateChat?: (documentId: string, updatedValues: any) => void;
  updateDocument?: (documentId: string, updatedValues: Partial<Document>) => void;
  url?: string;
  userId?: string;
}

export class Emulator extends React.Component<EmulatorProps, {}> {
  @CommandServiceInstance()
  private commandService: CommandServiceImpl;
  private conversationInitRequested: boolean;
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

  shouldStartNewConversation(props: EmulatorProps = this.props): boolean {
    return !props.directLine || props.conversationId !== (props.directLine as any).conversationId;
  }

  componentDidMount() {
    if (this.restartButtonRef) {
      this.restartButtonRef.focus();
    }
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
    const { activeDocumentId, documentId } = props;
    const { directLine, documentId: nextDocumentId } = nextProps;

    const documentIdChanged = !directLine || documentId !== nextDocumentId;

    if (documentIdChanged) {
      startNewConversation(nextProps).catch();
    }
    const switchedDocuments = activeDocumentId !== nextProps.activeDocumentId;
    const switchedToThisDocument = nextProps.activeDocumentId === documentId;

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
      : props.conversationId || `${uniqueId()}|${props.mode}`;

    let userId;
    if (requireNewUserId) {
      userId = uniqueIdv4();
    } else {
      // use the previous id, or custom id
      const { framework = {} } = this.props;
      userId = props.userId || framework.userGUID;
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
        if (props.documentId && props.inMemory && props.activities) {
          try {
            // transcript was deep linked via protocol or is generated in-memory via chatdown,
            // and should just be fed its own activities attached to the document
            await this.commandService.remoteCall<any>(
              SharedConstants.Commands.Emulator.FeedTranscriptFromMemory,
              conversation.conversationId,
              props.botId,
              props.userId,
              props.activities
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
              props.botId,
              props.userId,
              props.documentId
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
            {mode === 'livechat' && (
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
            )}
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

  private onStartOverClick = async (option: string = RestartConversationOptions.NewUserId): Promise<void> => {
    const { NewUserId, SameUserId } = RestartConversationOptions;
    this.props.setInspectorObjects(this.props.documentId, []);
    if (this.props.directLine) {
      this.props.directLine.end();
    }
    await this.props.clearLog(this.props.documentId);

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
    const { conversationId, documentId } = this.props;
    this.props.restartDebugSession(conversationId, documentId);
  };

  private setRestartButtonRef = (ref: HTMLButtonElement): void => {
    this.restartButtonRef = ref;
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
