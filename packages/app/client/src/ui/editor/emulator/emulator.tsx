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
import { Activity, uniqueId, uniqueIdv4 } from '@bfemulator/sdk-shared';
import { Splitter, SplitButton } from '@bfemulator/ui-react';
import base64Url from 'base64url';
import { IEndpointService } from 'botframework-config/lib/schema';
import * as React from 'react';
import { connect } from 'react-redux';
import { BehaviorSubject } from 'rxjs';
import * as ChatActions from '../../../data/action/chatActions';
import { updateDocument } from '../../../data/action/editorActions';
import * as PresentationActions from '../../../data/action/presentationActions';
import { Document } from '../../../data/reducer/editor';
import { RootState } from '../../../data/store';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';
import ChatPanel from './chatPanel/chatPanel';
import LogPanel from './logPanel/logPanel';
import PlaybackBar from './playbackBar/playbackBar';
import { debounce } from '../../../utils';
import { newNotification, Notification, SharedConstants } from '@bfemulator/app-shared';
import * as styles from './emulator.scss';
import { beginAdd } from '../../../data/action/notificationActions';
import { InspectorContainer } from './parts';
import { ToolBar } from './toolbar/toolbar';

const { encode } = base64Url;

const RestartConversationOptions = {
  NewUserId: 'Restart with new user ID',
  SameUserId: 'Restart with same user ID'
};

export type EmulatorMode = 'transcript' | 'livechat';

interface EmulatorProps {
  activeDocumentId?: string;
  clearLog?: (documentId: string) => void;
  conversationId?: string;
  createErrorNotification?: (notification: Notification) => void;
  dirty?: boolean;
  document?: any;
  documentId?: string;
  enablePresentationMode?: (enabled: boolean) => void;
  endpointId?: string;
  endpointService?: IEndpointService;
  mode?: EmulatorMode;
  newConversation?: (documentId: string, options: any) => void;
  presentationModeEnabled?: boolean;
  setInspectorObjects?: (documentId: string, objects: any) => void;
  updateChat?: (documentId: string, updatedValues: any) => void;
  updateDocument?: (documentId: string, updatedValues: Partial<Document>) => void;
  url?: string;
}

class EmulatorComponent extends React.Component<EmulatorProps, {}> {
  private readonly onVerticalSizeChange = debounce((sizes) => {
    this.props.document.ui = {
      ...this.props.document.ui,
      verticalSplitter: sizes
    };
  }, 500);

  private readonly onHorizontalSizeChange = debounce((sizes) => {
    this.props.document.ui = {
      ...this.props.document.ui,
      horizontalSplitter: sizes
    };
  }, 500);

  constructor(props: EmulatorProps) {
    super(props);
  }

  shouldStartNewConversation(props: EmulatorProps = this.props): boolean {
    return !props.document.directLine ||
      (props.document.conversationId !== props.document.directLine.conversationId);
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
    const { document = {} } = props;
    const { document: nextDocument = {} } = nextProps;

    const documentOrUserIdChanged = (!nextDocument.directLine && document.documentId !== nextDocument.documentId)
      || (document.userId !== nextDocument.userId);

    if (documentOrUserIdChanged) {
      startNewConversation(nextProps).catch();
    }

    const switchedDocuments = props.activeDocumentId !== nextProps.activeDocumentId;
    const switchedToThisDocument = (nextProps.activeDocumentId === props.documentId);

    if (switchedDocuments) {
      if (switchedToThisDocument) {
        window.removeEventListener('keydown', keyboardEventListener);
        window.addEventListener('keydown', keyboardEventListener);
      } else {
        window.removeEventListener('keydown', keyboardEventListener);
      }
    }
  }

  startNewConversation = async (props: EmulatorProps = this.props): Promise<any> => {
    if (props.document.subscription) {
      props.document.subscription.unsubscribe();
    }
    const selectedActivity$ = new BehaviorSubject<Activity | null>({});
    const subscription = selectedActivity$.subscribe((activity) => {

      if (activity && activity.showInInspector) {
        this.props.setInspectorObjects(props.document.documentId, activity);
      }
    });

    // TODO: Don't append mode
    const conversationId = `${ uniqueId() }|${ props.mode }`;
    const options = {
      conversationId,
      conversationMode: props.mode,
      endpointId: props.endpointId
    };

    if (props.document.directLine) {
      props.document.directLine.end();
    }

    this.initConversation(props, options, selectedActivity$, subscription);

    if (props.mode === 'transcript') {
      try {
        const conversation = await CommandServiceImpl.remoteCall(
          SharedConstants.Commands.Emulator.NewTranscript,
          conversationId
        );

        if (props.document && props.document.inMemory && props.document.activities) {
          try {
            // transcript was deep linked via protocol or is generated in-memory via chatdown,
            // and should just be fed its own activities attached to the document
            await CommandServiceImpl.remoteCall(
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
            const fileInfo: { fileName: string, filePath: string } = await CommandServiceImpl.remoteCall(
              SharedConstants.Commands.Emulator.FeedTranscriptFromDisk,
              conversation.conversationId,
              props.document.botId,
              props.document.userId,
              props.document.documentId
            );

            this.props.updateDocument(this.props.documentId, fileInfo);
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
  }

  initConversation(props: EmulatorProps, options: any, selectedActivity$: any, subscription: any): void {
    const encodedOptions = encode(JSON.stringify(options));

    // TODO: We need to use encoded token because we need to pass both endpoint ID and conversation ID
    //       We should think about a better model to pass conversation ID from Web Chat to emulator core
    const directLine = createDirectLine({
      secret: encodedOptions,
      domain: `${ this.props.url }/v3/directline`,
      webSocket: false
    });

    this.props.newConversation(props.documentId, {
      conversationId: options.conversationId,
      // webChatStore,
      directLine,
      selectedActivity$,
      subscription
    });
  }

  render(): JSX.Element {
    return this.props.presentationModeEnabled ? this.renderPresentationView() : this.renderDefaultView();
  }

  renderPresentationView(): JSX.Element {
    const transcriptMode = this.props.mode === 'transcript';
    const chatPanelChild = transcriptMode ? (
      <div className={ styles.presentationPlaybackDock }>
        <PlaybackBar/>
      </div>) : null;
    return (
      <div className={ styles.presentation }>
        <div className={ styles.presentationContent }>
          <ChatPanel mode={ this.props.mode } document={ this.props.document }
                     onStartConversation={ this.onStartOverClick }/>
          { chatPanelChild }
        </div>
        <span
          className={ styles.closePresentationIcon }
          onClick={ () => this.onPresentationClick(false) }
        />
      </div>
    );
  }

  renderDefaultView(): JSX.Element {
    const { NewUserId, SameUserId } = RestartConversationOptions;

    return (
      <div className={ styles.emulator }>
        {
          this.props.mode === 'livechat' &&
          <div className={ styles.header }>
            <ToolBar>
              <SplitButton
                defaultLabel="Restart conversation"
                buttonClass={ styles.restartIcon }
                options={ [NewUserId, SameUserId] }
                onClick={ this.onStartOverClick }/>
              <button
                className={ `${ styles.saveTranscriptIcon } ${ styles.toolbarIcon || '' }` }
                onClick={ this.onExportClick }
              >
                Save transcript
              </button>
            </ToolBar>
          </div>
        }
        <div className={ `${styles.content} ${styles.vertical}` }>
          <Splitter orientation="vertical" primaryPaneIndex={ 0 }
                    minSizes={ { 0: 80, 1: 80 } }
                    initialSizes={ this.getVerticalSplitterSizes }
                    onSizeChange={ this.onVerticalSizeChange }>
            <div className={ styles.content }>
              <ChatPanel mode={ this.props.mode }
                         className={ styles.chatPanel }
                         document={ this.props.document }
                         onStartConversation={ this.onStartOverClick }/>
            </div>
            <div className={ styles.content }>
              <Splitter orientation="horizontal" primaryPaneIndex={ 0 }
                        minSizes={ { 0: 80, 1: 80 } }
                        initialSizes={ this.getHorizontalSplitterSizes }
                        onSizeChange={ this.onHorizontalSizeChange }>
                <InspectorContainer document={ this.props.document }/>
                <LogPanel document={ this.props.document }/>
              </Splitter>
            </div>
          </Splitter>
        </div>
      </div>
    );
  }

  private getVerticalSplitterSizes = (): { [0]: string } => {
    return {
      0: `${this.props.document.ui.verticalSplitter[0].percentage}`
    };
  }

  private getHorizontalSplitterSizes = (): { [0]: string } => {
    return {
      0: `${this.props.document.ui.horizontalSplitter[0].percentage}`
    };
  }

  private onPresentationClick = (enabled: boolean): void => {
    this.props.enablePresentationMode(enabled);
  }

  private onStartOverClick = async (option: string = RestartConversationOptions.NewUserId): Promise<void> => {
    const { NewUserId, SameUserId } = RestartConversationOptions;
    this.props.clearLog(this.props.document.documentId);
    this.props.setInspectorObjects(this.props.document.documentId, []);

    switch (option) {
      case NewUserId:
        const newUserId = uniqueIdv4();
        // set new user as current on emulator facilities side
        await CommandServiceImpl.remoteCall(SharedConstants.Commands.Emulator.SetCurrentUser, newUserId);
        this.props.updateChat(this.props.documentId, { userId: newUserId });
        break;

      case SameUserId:
        this.startNewConversation();
        break;

      default:
        break;
    }
  }

  private onExportClick = (): void => {
    if (this.props.document.directLine) {
      CommandServiceImpl.remoteCall(
        SharedConstants.Commands.Emulator.SaveTranscriptToFile,
        this.props.document.directLine.conversationId
      );
    }
  }

  private readonly keyboardEventListener: EventListener = (event: KeyboardEvent): void => {
    // Meta corresponds to 'Command' on Mac
    const ctrlOrCmdPressed = event.getModifierState('Control') || event.getModifierState('Meta');
    const shiftPressed = ctrlOrCmdPressed && event.getModifierState('Shift');
    const key = event.key.toLowerCase();
    if (ctrlOrCmdPressed && shiftPressed && key === 'r') {
      this.onStartOverClick();
    }
  }
}

const mapStateToProps = (state: RootState, { documentId }: { documentId: string }): EmulatorProps => ({
  activeDocumentId: state.editor.editors[state.editor.activeEditor].activeDocumentId,
  conversationId: state.chat.chats[documentId].conversationId,
  document: state.chat.chats[documentId],
  endpointId: state.chat.chats[documentId].endpointId,
  presentationModeEnabled: state.presentation.enabled
});

const mapDispatchToProps = (dispatch): EmulatorProps => ({
  enablePresentationMode: enable => enable ? dispatch(PresentationActions.enable())
    : dispatch(PresentationActions.disable()),
  setInspectorObjects: (documentId, objects) => dispatch(ChatActions.setInspectorObjects(documentId, objects)),
  clearLog: documentId => dispatch(ChatActions.clearLog(documentId)),
  newConversation: (documentId, options) => dispatch(ChatActions.newConversation(documentId, options)),
  updateChat: (documentId: string, updatedValues: any) => dispatch(ChatActions.updateChat(documentId, updatedValues)),
  updateDocument: (documentId, updatedValues: Partial<Document>) => dispatch(updateDocument(documentId, updatedValues)),
  createErrorNotification: (notification: Notification) => dispatch(beginAdd(notification))
});

export const Emulator = connect(mapStateToProps, mapDispatchToProps)(EmulatorComponent as any) as any;
