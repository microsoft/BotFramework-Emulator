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
import { connect } from 'react-redux';
import { TreeView } from '@fuselab/ui-fabric/lib';
import { ExpandCollapse, ExpandCollapseContent } from '@bfemulator/ui-react';
import { CommandServiceImpl } from '../../../../platform/commands/commandServiceImpl';
import { FileTreeDataProvider } from './fileTreeProvider';
import { isChatFile, isTranscriptFile } from '../../../../utils';
import * as styles from './fileTreeExplorer.scss';
class FileExplorerComponent extends React.Component {
    render() {
        return (React.createElement(ExpandCollapse, { expanded: true, title: "File Explorer", className: styles.fileTreeExplorer }, this.renderFileTree()));
    }
    handleTranscriptClick(filename) {
        CommandServiceImpl.call('transcript:open', filename);
    }
    handleChatClick(filename) {
        CommandServiceImpl.call('chat:open', filename);
    }
    renderFileTree() {
        if (!this.props.files.root) {
            return null;
        }
        const provider = new FileTreeDataProvider(this.props.files);
        const props = {
            loadContainer: provider.loadContainer.bind(provider),
            remove: provider.remove.bind(provider),
            insertAt: provider.insertAt.bind(provider),
            selectNode: node => {
                if (isTranscriptFile(node.data.path)) {
                    this.handleTranscriptClick(node.data.path);
                }
                else if (isChatFile(node.data.path)) {
                    this.handleChatClick(node.data.path);
                }
                provider.selectNode.bind(provider);
            },
            selectedData: provider.selected,
            getStyle: provider.getStyle.bind(provider),
            data: provider.root,
            selected: false,
            parent: null,
            compact: true,
            readonly: true,
            theme: 'dark',
            hideRoot: true
        };
        return (React.createElement(ExpandCollapseContent, { key: 'transcript-explorer-tree' },
            React.createElement(TreeView, Object.assign({}, props))));
    }
}
function mapStateToProps(state) {
    return {
        activeEditor: state.editor.activeEditor,
        activeDocumentId: state.editor.editors[state.editor.activeEditor].activeDocumentId,
        transcripts: state.chat.transcripts,
        files: state.files
    };
}
export const FileExplorer = connect(mapStateToProps)(FileExplorerComponent);
//# sourceMappingURL=fileExplorer.js.map