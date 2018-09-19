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
import { RootState } from '../../../data/store';
import { Splitter } from '@bfemulator/ui-react';
import * as styles from '../main.scss';
import { ExplorerBar } from '../explorer';
import store from '../../../data/store';
import * as ExplorerActions from '../../../data/action/explorerActions';
import { TabGroups } from './tabGroups';

export interface WorkBenchProps {
  showExplorer: boolean;
}

export class WorkBenchComponent extends React.Component<WorkBenchProps, {}> {
  private _splitterRef: Splitter;

  constructor(props: WorkBenchProps) {
    super(props);
  }

  public componentDidUpdate(prevProps: WorkBenchProps): void {
    // if the workbench just re-rendered due to showing / hiding the explorer
    if (prevProps.showExplorer !== this.props.showExplorer) {
      if (this.props.showExplorer) {
        // restore the initial pane sizes 
        this._splitterRef.calculateInitialPaneSizes();
      } else {
        // cause the primary pane (tab groups) to fill up the remaining space
        this._splitterRef.forcePaneRedraw(1);
      }
    }
  }

  public render(): JSX.Element {
    const innerContent = [
      <ExplorerBar key={ 'explorer-bar' }/>,
      <TabGroups key={ 'tab-groups' }/>
    ];

    return (
      <div className={ styles.workbench }>
        <Splitter
          orientation={ 'vertical' }
          primaryPaneIndex={ 0 }
          minSizes={ { 1: 40 } }
          initialSizes={ { 0: 280 } }
          onSizeChange={ this.checkExplorerSize }
          ref={ ref => this._splitterRef = ref }>
          { innerContent }
        </Splitter>
      </div>
    );
  }

  /** Called when the splitter between the editor and explorer panes is moved */
  private checkExplorerSize(sizes: { absolute: number, percentage: number }[]): void {
    if (sizes.length) {
      const explorerSize = sizes[0];
      const minExplorerWidth = 175;
      if (explorerSize.absolute < minExplorerWidth) {
        store.dispatch(ExplorerActions.showExplorer(false));
      }
    }
  }
}

function mapStateToProps(state: RootState): WorkBenchProps {
  return {
    showExplorer: state.explorer.showing
  };
}

export const WorkBench = connect(mapStateToProps, null)(WorkBenchComponent);
