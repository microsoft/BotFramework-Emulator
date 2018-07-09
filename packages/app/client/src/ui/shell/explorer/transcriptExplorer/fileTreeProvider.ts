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

import { FileInfo } from '@bfemulator/app-shared';
import { Container, ITreeNodeView, TreeDataProvider, TreeNode } from '@fuselab/ui-fabric/lib/tree';
import { fileExtensionToIcon, iconDefinitionToStyle } from '@fuselab/ui-fabric/lib/themes';
import { IStyleSet } from '@uifabric/styling/lib';

import { IFileTreeState } from '../../../../data/reducer/files';

/**
 * File tree data provider
 */
export class FileTreeDataProvider implements TreeDataProvider<FileInfo> {
  private _selected: TreeNode<FileInfo>;

  constructor(private _tree: IFileTreeState) {
  }

  public async loadContainer(_container: Container<FileInfo>): Promise<TreeNode<FileInfo>[]> {
    return Promise.reject(new Error('nyi'));
  }

  public insertAt(_container: Container<FileInfo>, _node: TreeNode<FileInfo>) {
    return null;
  }

  public remove(_node: TreeNode<FileInfo>): Promise<TreeNode<FileInfo>> {
    return Promise.reject(new Error('file tree node removal NYI'));
  }

  public selectNode(node: TreeNode<FileInfo>) {
    this.tree.selected = node;
  }

  public get root(): Container<FileInfo> {
    return <Container<FileInfo>> this.tree.root;
  }

  public get tree(): IFileTreeState {
    return this._tree;
  }

  public get selected(): TreeNode<FileInfo> {
    return this._selected;
  }

  public getStyle(node: ITreeNodeView): IStyleSet {
    if (node.node.type === 'leaf') {
      const name = node.node.name;
      const iconDefinition = fileExtensionToIcon(name, node.theme);
      const iconStyle = iconDefinitionToStyle(iconDefinition, node.theme);

      return { icon: iconStyle };
    }

    return null;
  }
}
