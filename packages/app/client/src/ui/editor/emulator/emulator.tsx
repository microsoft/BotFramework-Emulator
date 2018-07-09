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

import * as BotChat from 'botframework-webchat';

import { uniqueId } from '@bfemulator/sdk-shared';
import { Splitter } from '@bfemulator/ui-react';
import base64Url from 'base64url';
import { IEndpointService } from 'msbot/bin/schema';
import * as React from 'react';
import { connect } from 'react-redux';
import { BehaviorSubject } from 'rxjs';
import * as ChatActions from '../../../data/action/chatActions';
import { updateDocument } from '../../../data/action/editorActions';
import * as PresentationActions from '../../../data/action/presentationActions';
import { Document } from '../../../data/reducer/editor';
import { RootState } from '../../../data/store';

import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';
import { SettingsService } from '../../../platform/settings/settingsService';
import ToolBar, { Button as ToolBarButton } from '../toolbar/toolbar';
import ChatPanel from './chatPanel/chatPanel';
import DetailPanel from './detailPanel/detailPanel';
import LogPanel from './logPanel/logPanel';
import PlaybackBar from './playbackBar/playbackBar';
import { debounce } from '../../utils/debounce';
import * as styles from './emulator.scss';

const { encode } = base64Url;

export type EmulatorMode = 'transcript' | 'livechat';

interface EmulatorProps {
  clearLog?: (documentId: string) => void;
  conversationId?: string;
  dirty?: boolean;
  document?: any;
  documentId?: string;
  enablePresentationMode?: (enabled: boolean) => void;
  endpointId?: string;
  endpointService?: IEndpointService;
  mode?: EmulatorMode;
  newConversation?: (documentId: string, options: any) => void;
  pingDocument?: (documentId: string) => void;
  pingId?: number;
  presentationModeEnabled?: boolean;
  setInspectorObjects?: (documentId: string, objects: any) => void;
  updateDocument?: (documentId: string, updatedValues: any) => void;
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

  shouldStartNewConversation(props?: any) {
    props = props || this.props;
    return !props.document.directLine ||
      (props.document.conversationId !== props.document.directLine.conversationId);
  }

  componentWillMount() {
    if (this.shouldStartNewConversation()) {
      this.startNewConversation();
    }
  }

  componentWillReceiveProps(nextProps: any) {
    if (!nextProps.document.directLine && this.props.document.documentId !== nextProps.document.documentId) {
      this.startNewConversation(nextProps).catch();
    }
    if (this.props.document.documentId !== nextProps.document.documentId) {
      this.props.pingDocument(nextProps.document.documentId);
    }
  }

  async startNewConversation(props?: any) {
    props = props || this.props;

    if (props.document.subscription) {
      props.document.subscription.unsubscribe();
    }
    const selectedActivity$ = new BehaviorSubject({});
    const subscription = selectedActivity$.subscribe((obj: any) => {
      if (obj && obj.activity) {
        this.props.setInspectorObjects(props.document.documentId, obj.activity);
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
        const conversation = await CommandServiceImpl.remoteCall('transcript:new', conversationId);

        if (props.document && props.document.deepLink && props.document.activities) {
          try {
            // transcript was deep linked via protocol,
            // and should just be fed its own activities attached to the document
            await CommandServiceImpl.remoteCall(
              'emulator:feed-transcript:deep-link',
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
              'emulator:feed-transcript:disk',
              conversation.conversationId,
              props.document.botId,
              props.document.userId,
              props.document.documentId
            );

            this.props.updateDocument(this.props.documentId, { fileName: fileInfo.fileName });
          } catch (err) {
            throw new Error(`Error while feeding transcript on disk to conversation: ${err}`);
          }
        }
      } catch (err) {
        // TODO: surface error somewhere
        console.error('Error creating a new conversation for transcript mode: ', err);
      }
    }
  }

  initConversation(props: any, options: any, selectedActivity$: any, subscription: any) {
    const encodedOptions = encode(JSON.stringify(options));

    // TODO: We need to use encoded token because we need to pass both endpoint ID and conversation ID
    //       We should think about a better model to pass conversation ID from Web Chat to emulator core
    const directLine = new BotChat.DirectLine({
      secret: encodedOptions,
      domain: `${ SettingsService.emulator.url }/v3/directline`,
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
                     onStartConversation={ this.handleStartOverClick }/>
          { chatPanelChild }
        </div>
        <span className={ styles.closePresentationIcon } onClick={ () => this.handlePresentationClick(false) }></span>
      </div>
    );
  }

  renderDefaultView(): JSX.Element {
    return (
      <div className={ styles.emulator } key={ this.props.pingId }>
        {
          this.props.mode === 'livechat' &&
          <div className={ styles.header }>
            <ToolBar>
              <ToolBarButton visible={ true } title="Start Over" onClick={ this.handleStartOverClick }/>
              <ToolBarButton visible={ true } title="Save Transcript As..." onClick={ this.handleExportClick }/>
            </ToolBar>
          </div>
        }
        <div className={ `${styles.content} ${styles.vertical}` }>
          <Splitter orientation="vertical" primaryPaneIndex={ 0 }
                    minSizes={ { 0: 80, 1: 80 } }
                    initialSizes={ this.getVerticalSplitterSizes }
                    onSizeChange={ this.onVerticalSizeChange }
                    key={ this.props.pingId }>
            <div className={ styles.content }>
              <ChatPanel mode={ this.props.mode }
                         className={ styles.chatPanel }
                         document={ this.props.document }
                         onStartConversation={ this.handleStartOverClick }/>
            </div>
            <div className={ styles.content }>
              <Splitter orientation="horizontal" primaryPaneIndex={ 0 }
                        minSizes={ { 0: 80, 1: 80 } }
                        initialSizes={ this.getHorizontalSplitterSizes }
                        onSizeChange={ this.onHorizontalSizeChange }
                        key={ this.props.pingId }>
                <DetailPanel document={ this.props.document } key={ this.props.pingId }/>
                <LogPanel document={ this.props.document } key={ this.props.pingId }/>
              </Splitter>
            </div>
          </Splitter>
        </div>
      </div>
    );
  }

  private getVerticalSplitterSizes = () => {
    return {
      0: `${this.props.document.ui.verticalSplitter[0].percentage}`
    };
  }

  private getHorizontalSplitterSizes = () => {
    return {
      0: `${this.props.document.ui.horizontalSplitter[0].percentage}`
    };
  }

  private handlePresentationClick = (enabled: boolean) => {
    this.props.enablePresentationMode(enabled);
  }

  private handleStartOverClick = () => {
    this.props.clearLog(this.props.document.documentId);
    this.props.setInspectorObjects(this.props.document.documentId, []);
    this.startNewConversation();
  }

  private handleExportClick = () => {
    if (this.props.document.directLine) {
      CommandServiceImpl.remoteCall('emulator:save-transcript-to-file', this.props.document.directLine.conversationId);
    }
  }
}

const mapStateToProps = (state: RootState, { documentId }: { documentId: string }): EmulatorProps => ({
  conversationId: state.chat.chats[documentId].conversationId,
  document: state.chat.chats[documentId],
  endpointId: state.chat.chats[documentId].endpointId,
  pingId: state.chat.chats[documentId].pingId,
  presentationModeEnabled: state.presentation.enabled
});

const mapDispatchToProps = (dispatch): EmulatorProps => ({
  pingDocument: documentId => dispatch(ChatActions.pingDocument(documentId)),
  enablePresentationMode: enable => enable ? dispatch(PresentationActions.enable())
    : dispatch(PresentationActions.disable()),
  setInspectorObjects: (documentId, objects) => dispatch(ChatActions.setInspectorObjects(documentId, objects)),
  clearLog: documentId => dispatch(ChatActions.clearLog(documentId)),
  newConversation: (documentId, options) => dispatch(ChatActions.newConversation(documentId, options)),
  updateDocument: (documentId, updatedValues: Partial<Document>) => dispatch(updateDocument(documentId, updatedValues))
});

export const Emulator = connect(mapStateToProps, mapDispatchToProps)(EmulatorComponent as any) as any;
