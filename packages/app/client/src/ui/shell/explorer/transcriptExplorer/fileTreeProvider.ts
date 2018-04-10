import {FileInfo} from '@BFEmulator/app-shared';
import {Container, Leaf, ITreeNodeView, TreeDataProvider, TreeNode, TreeState} from '@intercom/ui-fabric/lib/tree';
import {fileExtensionToIcon, iconDefinitionToStyle} from '@intercom/ui-fabric/lib/themes';
import {pathExt} from '@intercom/ui-shared/lib';
import {IStyleSet} from '@uifabric/styling/lib';

import * as _ from 'lodash';
import {IFileTreeState} from '../../../../data/reducer/files';

/**
 * File tree data provider
 */
export class FileTreeDataProvider implements TreeDataProvider<FileInfo> {
    private _selected: TreeNode<FileInfo>;

    constructor(private _tree:IFileTreeState) {
    }

    public async loadContainer(container: Container<FileInfo>): Promise<TreeNode<FileInfo>[]> {
        return Promise.reject(new Error('nyi'));
    }

    public insertAt(container: Container<FileInfo>, node: TreeNode<FileInfo>) {
    }

    public remove(node: TreeNode<FileInfo>): Promise<TreeNode<FileInfo>> {
        return Promise.reject(new Error('file tree node removal NYI'))
    }

    public selectNode(node: TreeNode<FileInfo>) {
        this.tree.selected = node;
    }

    public get root() : Container<FileInfo> {
        return <Container<FileInfo>>this.tree.root;
    }

    public get tree() : IFileTreeState {
        return this._tree;
    }

    public get selected(): TreeNode<FileInfo> {
        return this._selected;
    }

    public getStyle(node: ITreeNodeView) : IStyleSet {
        if (node.node.type === 'leaf') {
            const name = node.node.name;
            const iconDefinition = fileExtensionToIcon(name, node.theme);
            const iconStyle = iconDefinitionToStyle(iconDefinition, node.theme);
      
            return { icon: iconStyle };
          }
      
          return null;      
    }
}