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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as BotChat from 'botframework-webchat';
import { uniqueId } from '@bfemulator/sdk-shared';
import { Splitter } from '@bfemulator/ui-react';
import base64Url from 'base64url';
import * as React from 'react';
import { connect } from 'react-redux';
import { BehaviorSubject } from 'rxjs';
import * as ChatActions from '../../../data/action/chatActions';
import { updateDocument } from '../../../data/action/editorActions';
import * as PresentationActions from '../../../data/action/presentationActions';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';
import { SettingsService } from '../../../platform/settings/settingsService';
import ToolBar, { Button as ToolBarButton } from '../toolbar/toolbar';
import ChatPanel from './chatPanel/chatPanel';
import DetailPanel from './detailPanel/detailPanel';
import LogPanel from './logPanel/logPanel';
import PlaybackBar from './playbackBar/playbackBar';
import { debounce } from '../../../utils';
import { SharedConstants } from '@bfemulator/app-shared';
import * as styles from './emulator.scss';
const { encode } = base64Url;
class EmulatorComponent extends React.Component {
    constructor(props) {
        super(props);
        this.onVerticalSizeChange = debounce((sizes) => {
            this.props.document.ui = Object.assign({}, this.props.document.ui, { verticalSplitter: sizes });
        }, 500);
        this.onHorizontalSizeChange = debounce((sizes) => {
            this.props.document.ui = Object.assign({}, this.props.document.ui, { horizontalSplitter: sizes });
        }, 500);
        this.getVerticalSplitterSizes = () => {
            return {
                0: `${this.props.document.ui.verticalSplitter[0].percentage}`
            };
        };
        this.getHorizontalSplitterSizes = () => {
            return {
                0: `${this.props.document.ui.horizontalSplitter[0].percentage}`
            };
        };
        this.handlePresentationClick = (enabled) => {
            this.props.enablePresentationMode(enabled);
        };
        this.handleStartOverClick = () => {
            this.props.clearLog(this.props.document.documentId);
            this.props.setInspectorObjects(this.props.document.documentId, []);
            this.startNewConversation();
        };
        this.handleExportClick = () => {
            if (this.props.document.directLine) {
                CommandServiceImpl.remoteCall(SharedConstants.Commands.Emulator.SaveTranscriptToFile, this.props.document.directLine.conversationId);
            }
        };
    }
    shouldStartNewConversation(props) {
        props = props || this.props;
        return !props.document.directLine ||
            (props.document.conversationId !== props.document.directLine.conversationId);
    }
    componentWillMount() {
        if (this.shouldStartNewConversation()) {
            this.startNewConversation();
        }
    }
    componentWillReceiveProps(nextProps) {
        if (!nextProps.document.directLine && this.props.document.documentId !== nextProps.document.documentId) {
            this.startNewConversation(nextProps).catch();
        }
        if (this.props.document.documentId !== nextProps.document.documentId) {
            this.props.pingDocument(nextProps.document.documentId);
        }
    }
    startNewConversation(props) {
        return __awaiter(this, void 0, void 0, function* () {
            props = props || this.props;
            if (props.document.subscription) {
                props.document.subscription.unsubscribe();
            }
            const selectedActivity$ = new BehaviorSubject({});
            const subscription = selectedActivity$.subscribe((obj) => {
                if (obj && obj.activity) {
                    this.props.setInspectorObjects(props.document.documentId, obj.activity);
                }
            });
            // TODO: Don't append mode
            const conversationId = `${uniqueId()}|${props.mode}`;
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
                    const conversation = yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Emulator.NewTranscript, conversationId);
                    if (props.document && props.document.inMemory && props.document.activities) {
                        try {
                            // transcript was deep linked via protocol or is generated in-memory via chatdown,
                            // and should just be fed its own activities attached to the document
                            yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Emulator.FeedTranscriptFromMemory, conversation.conversationId, props.document.botId, props.document.userId, props.document.activities);
                        }
                        catch (err) {
                            throw new Error(`Error while feeding deep-linked transcript to conversation: ${err}`);
                        }
                    }
                    else {
                        try {
                            // the transcript is on disk, so its activities need to be read on the main side and fed in
                            const fileInfo = yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Emulator.FeedTranscriptFromDisk, conversation.conversationId, props.document.botId, props.document.userId, props.document.documentId);
                            this.props.updateDocument(this.props.documentId, { fileName: fileInfo.fileName });
                        }
                        catch (err) {
                            throw new Error(`Error while feeding transcript on disk to conversation: ${err}`);
                        }
                    }
                }
                catch (err) {
                    // TODO: surface error somewhere
                    console.error('Error creating a new conversation for transcript mode: ', err);
                }
            }
        });
    }
    initConversation(props, options, selectedActivity$, subscription) {
        const encodedOptions = encode(JSON.stringify(options));
        // TODO: We need to use encoded token because we need to pass both endpoint ID and conversation ID
        //       We should think about a better model to pass conversation ID from Web Chat to emulator core
        const directLine = new BotChat.DirectLine({
            secret: encodedOptions,
            domain: `${SettingsService.emulator.url}/v3/directline`,
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
    render() {
        return this.props.presentationModeEnabled ? this.renderPresentationView() : this.renderDefaultView();
    }
    renderPresentationView() {
        const transcriptMode = this.props.mode === 'transcript';
        const chatPanelChild = transcriptMode ? (React.createElement("div", { className: styles.presentationPlaybackDock },
            React.createElement(PlaybackBar, null))) : null;
        return (React.createElement("div", { className: styles.presentation },
            React.createElement("div", { className: styles.presentationContent },
                React.createElement(ChatPanel, { mode: this.props.mode, document: this.props.document, onStartConversation: this.handleStartOverClick }),
                chatPanelChild),
            React.createElement("span", { className: styles.closePresentationIcon, onClick: () => this.handlePresentationClick(false) })));
    }
    renderDefaultView() {
        return (React.createElement("div", { className: styles.emulator, key: this.props.pingId },
            this.props.mode === 'livechat' &&
                React.createElement("div", { className: styles.header },
                    React.createElement(ToolBar, null,
                        React.createElement(ToolBarButton, { visible: true, title: "Start Over", onClick: this.handleStartOverClick }),
                        React.createElement(ToolBarButton, { visible: true, title: "Save Transcript As...", onClick: this.handleExportClick }))),
            React.createElement("div", { className: `${styles.content} ${styles.vertical}` },
                React.createElement(Splitter, { orientation: "vertical", primaryPaneIndex: 0, minSizes: { 0: 80, 1: 80 }, initialSizes: this.getVerticalSplitterSizes, onSizeChange: this.onVerticalSizeChange, key: this.props.pingId },
                    React.createElement("div", { className: styles.content },
                        React.createElement(ChatPanel, { mode: this.props.mode, className: styles.chatPanel, document: this.props.document, onStartConversation: this.handleStartOverClick })),
                    React.createElement("div", { className: styles.content },
                        React.createElement(Splitter, { orientation: "horizontal", primaryPaneIndex: 0, minSizes: { 0: 80, 1: 80 }, initialSizes: this.getHorizontalSplitterSizes, onSizeChange: this.onHorizontalSizeChange, key: this.props.pingId },
                            React.createElement(DetailPanel, { document: this.props.document, key: this.props.pingId }),
                            React.createElement(LogPanel, { document: this.props.document, key: this.props.pingId })))))));
    }
}
const mapStateToProps = (state, { documentId }) => ({
    conversationId: state.chat.chats[documentId].conversationId,
    document: state.chat.chats[documentId],
    endpointId: state.chat.chats[documentId].endpointId,
    pingId: state.chat.chats[documentId].pingId,
    presentationModeEnabled: state.presentation.enabled
});
const mapDispatchToProps = (dispatch) => ({
    pingDocument: documentId => dispatch(ChatActions.pingDocument(documentId)),
    enablePresentationMode: enable => enable ? dispatch(PresentationActions.enable())
        : dispatch(PresentationActions.disable()),
    setInspectorObjects: (documentId, objects) => dispatch(ChatActions.setInspectorObjects(documentId, objects)),
    clearLog: documentId => dispatch(ChatActions.clearLog(documentId)),
    newConversation: (documentId, options) => dispatch(ChatActions.newConversation(documentId, options)),
    updateDocument: (documentId, updatedValues) => dispatch(updateDocument(documentId, updatedValues))
});
export const Emulator = connect(mapStateToProps, mapDispatchToProps)(EmulatorComponent);
//# sourceMappingURL=emulator.js.map