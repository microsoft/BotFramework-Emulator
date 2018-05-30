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
import { baseName } from '@fuselab/ui-shared/lib/path';
import { Container, Leaf, TreeNode, TreeState } from '@fuselab/ui-fabric/lib/tree';
import { FileActions } from '../action/fileActions';

export type IFileTreeState = TreeState<FileInfo>;
export type FileTreeNode = TreeNode<FileInfo>;

interface SetRootAction {
  type: FileActions.setRoot;
  payload: {
    path: string;
  };
}

interface AddFileAction {
  type: FileActions.add;
  payload: FileInfo;
}

interface RemoveFileAction {
  type: FileActions.remove;
  payload: {
    path: string;
  };
}

interface ClearFilesAction {
  type: FileActions.clear;
  payload: {};
}

type IFileAction = SetRootAction | AddFileAction | RemoveFileAction | ClearFilesAction;

const seps = /[\/\\]/;

function ensureAncestors(state: IFileTreeState, path: string): { state: IFileTreeState, parent: Container<FileInfo> } {
  let cur = <Container<FileInfo>> state.root;
  if (!cur) {
    return { state, parent: null };
  }

  const sub = path.substr(cur.data.path.length);
  const ancestors = sub.split(seps).filter(x => x).slice(0, -1);

  for (const ancestor of ancestors) {
    let next = <Container<FileInfo>> cur.children.find(x => x.name === ancestor);
    if (!next) {
      next = {
        name: ancestor,
        children: [],
        level: cur.level + 1,
        ...cur,
      };
      cur.children.push(next);
    }
    cur = next;
  }

  return { state, parent: cur };
}

function addFile(state: IFileTreeState, file: FileInfo): IFileTreeState {
  if (!state.root || state.root.data.path === file.path) {
    return state;
  }

  const r = ensureAncestors(state, file.path);
  state = r.state;
  const parent = r.parent;

  if (!parent) {
    return state;
  }
  const cur: FileTreeNode = <Leaf<FileInfo> | Container<FileInfo>> {
    type: file.type,
    name: file.name,
    data: file,
    level: parent.level + 1,
    parent,
    children: file.type === 'container' ? [] : undefined
  };

  if (parent.type === 'container') {
    parent.children.push(cur);
  }

  return { ...state };
}

function removeFile(state: IFileTreeState, path: string): IFileTreeState {
  const r = ensureAncestors(state, path);
  state = r.state;
  const parent = r.parent;
  if (parent && parent.type === 'container') {
    parent.children = parent.children.filter(x => x.data.path !== path);
  }
  return { ...state };
}

function clearFiles(state: IFileTreeState): IFileTreeState {
  const newState: IFileTreeState = {
    ...state,
    root: null,
    selected: null
  };
  return newState;
}

function files(state: IFileTreeState = { root: null, selected: null }, action: IFileAction): IFileTreeState {
  switch (action.type) {
    case FileActions.setRoot: {
      // don't set the root again if it's the same
      if (state.root && state.root.data.path === action.payload.path) {
        break;
      }

      const { path } = action.payload;
      const rootInfo: FileInfo = {
        type: 'container',
        name: baseName(path),
        path
      };
      const root: Container<FileInfo> = {
        type: 'container',
        parent: null,
        level: 1,
        name: baseName(path),
        children: [],
        data: rootInfo
      };
      state = { root, selected: root };
      break;
    }

    case FileActions.add:
      state = addFile(state, action.payload);
      break;
      
    case FileActions.remove:
      state = removeFile(state, action.payload.path);
      break;

    case FileActions.clear:
      state = clearFiles(state);
      break;

    default:
      break;
  }

  return state;
}

export default files;
