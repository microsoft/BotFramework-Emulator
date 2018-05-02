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

import { css } from 'glamor';
import * as React from 'react';
import { connect } from 'react-redux';
import { FileInfo } from '@bfemulator/app-shared';
import { lazy, pathExt } from '@fuselab/ui-shared/lib';
import { TreeView, TreeViewProps, initFontFaces, ITreeView, ITreeNodeView } from '@fuselab/ui-fabric/lib';
import * as constants from '../../../../constants';
import { SettingsService } from '../../../../platform/settings/settingsService';
import * as ChatActions from '../../../../data/action/chatActions';
import * as EditorActions from '../../../../data/action/editorActions';
import { Colors, ExpandCollapse, ExpandCollapseControls, ExpandCollapseContent } from '@bfemulator/ui-react';
import ExplorerItem from '../explorerItem';
import store from '../../../../data/store';
import { IFileTreeState } from '../../../../data/reducer/files';
import { EXPLORER_CSS } from '../explorerStyle';
import { CommandService } from '../../../../platform/commands/commandService';
import { FileTreeDataProvider } from './fileTreeProvider';

const CONVO_CSS = css({
  display: 'flex',
  flexDirection: 'column',
  listStyleType: 'none',
  margin: 0,
  padding: 0,
  overflowY: 'auto',
  overflowX: 'hidden',

  '& .empty-list': {
    fontStyle: 'italic',
  }
});

interface TranscriptExplorerProps {
  activeEditor: string,
  activeDocumentId: string,
  transcripts: any[],
  changeKey: number,
  files: IFileTreeState

}

function isTranscript(path: string): boolean {
  const ext = (pathExt(path) || '').toLowerCase();
  return ext === 'transcript';
}

class _TranscriptExplorer extends React.Component<TranscriptExplorerProps> {
  private onItemClick: (name: string) => void;
  private _treeRef: any;

  constructor(props) {
    super(props);
    this.onItemClick = this.handleItemClick.bind(this);
  }

  private handleItemClick(filename) {
    CommandService.call("transcript:open", filename);
  }

  private renderFileTree(): JSX.Element {
    if (!this.props.files.root) {
      return null;
    }
    const provider = new FileTreeDataProvider(this.props.files);
    const props: TreeViewProps<FileInfo> = {
      loadContainer: provider.loadContainer.bind(provider),
      remove: provider.remove.bind(provider),
      insertAt: provider.insertAt.bind(provider),
      selectNode: node => {
        if (isTranscript(node.data.path)) {
          this.handleItemClick(node.data.path);
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
      hideRoot: true,
      componentRef: this.saveTreeViewRef
    };

    return (
      <ExpandCollapseContent key={ this.props.changeKey }>
        <TreeView { ...props } />
      </ExpandCollapseContent>
    );
  }

  private renderTranscriptList(): JSX.Element {
    return (
      <ExpandCollapseContent key={ this.props.changeKey }>
        <ul { ...CONVO_CSS }>
          {
            this.props.transcripts.map(filename =>
              <ExplorerItem key={ filename } active={ this.props.activeDocumentId === filename } onClick={ () => this.onItemClick(filename) }>
                <span>{ filename.replace(/\\$/, '').split('\\').pop() }</span>
              </ExplorerItem>
            )
          }
        </ul>
      </ExpandCollapseContent>
    );
  }

  private renderEmptyTranscriptList(): JSX.Element {
    return (
      <ExpandCollapseContent key={ this.props.changeKey }>
        <ul { ...CONVO_CSS }>
          <li><span className="empty-list">No transcripts yet</span></li>
          <li>&nbsp;</li>
        </ul>
      </ExpandCollapseContent>
    );
  }

  @lazy()
  private get setiFont(): string {
    const fontCalc = x => `url(./external/media${x})`;
    initFontFaces(fontCalc);
    return './external/media';
  }

  public componentDidMount() {
    // make sure setiFont is injected
    const font = this.setiFont;

    // try to look at the previous snapshot of the tree's expanded state and restore 
  }

  public componentWillUnmount(): void {
    // take snapshot of what tree nodes were expanded
    // { filePath: expanded }
    let treeStateSnapshot: { [key: string]: boolean } = {};

    if (this._treeRef) {
      let treeIterator = this.iterateTreeViewNodes(this._treeRef.root);
      let treeNode = treeIterator.next();
      while (!treeNode.done) {
        if (treeNode.value.expanded)
          treeStateSnapshot[treeNode.value.node.name] = true;
        treeNode = treeIterator.next();
      }
    }

    // currently, this is giving us the name of the folders that are expanded;
    // we need to get the full path so that we don't accidentally expand
    // FolderA/Folder1/Assets instead of FolderC/Folder1/Folder2/Assets
    console.log(treeStateSnapshot);
  }

  /** Save a copy of the Fabric Tree's component ref */
  private saveTreeViewRef = (ref: ITreeView): void => {
   this._treeRef = ref as any;
  }

  /** Iterates over all the nodes in the Tree View Component */
  private * iterateTreeViewNodes(treeRoot: ITreeNodeView): Iterator<ITreeNodeView> {
    // make a queue with the root at the front
    const queue = [treeRoot];

    while (queue.length > 0) {
      // take the first node out of the queue
      let head: ITreeNodeView = queue.shift();

      // get the children for the node
      let children = head.children;
      let child = children.next();

      // loop over children and push any into queue
      while (!child.done) {
        queue.push(child.value);
        child = children.next();
      }

      // return the node we just inspected before tossing it
      yield head;
    }
  }

  public render(): JSX.Element {
    return (
      <div { ...EXPLORER_CSS }>
        <ExpandCollapse
          expanded={ true }
          title="File Explorer"
        >
          { this.renderFileTree() }
          {/*
            this.props.transcripts.length
              ? this.renderTranscriptList()
              : this.renderEmptyTranscriptList()
          */
          }
        </ExpandCollapse>
      </div>
    );
  }
}

function mapStateToProps(state: any): TranscriptExplorerProps {
  return {
    activeEditor: state.editor.activeEditor,
    activeDocumentId: state.editor.editors[state.editor.activeEditor].activeDocumentId,
    transcripts: state.chat.transcripts,
    changeKey: state.chat.changeKey,
    files: state.files
  };
}

export const TranscriptExplorer = (connect(mapStateToProps, null)(_TranscriptExplorer)) as any;
