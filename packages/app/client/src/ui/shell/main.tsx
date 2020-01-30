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

import { Splitter } from '@bfemulator/ui-react';
import * as React from 'react';
import { isLinux, isWindows, showExplorer, Editor } from '@bfemulator/app-shared';

import * as Constants from '../../constants';
import { StoreVisualizer } from '../debug/storeVisualizer';
import { DialogHostContainer, TabManagerContainer } from '../dialogs';
import { store } from '../../state/store';

import { ExplorerBar } from './explorer';
import * as styles from './main.scss';
import { MDI } from './mdi';
import { NavBar } from './navBar';
import { StatusBar } from './statusBar/statusBar';
import { AppMenuContainer } from './appMenu/appMenuContainer';

export interface MainProps {
  applicationMountComplete?: () => void;
  primaryEditor?: Editor;
  secondaryEditor?: Editor;
  explorerIsVisible?: boolean;
  presentationModeEnabled?: boolean;
  navBarSelection?: string;
  exitPresentationMode?: (e: Event) => void;
}

export interface MainState {
  tabValue: number;
}

export class Main extends React.Component<MainProps, MainState> {
  private platform: string;

  constructor(props: MainProps) {
    super(props);

    this.state = {
      tabValue: 0,
    };
    this.platform = process.platform;
  }

  public componentWillReceiveProps(newProps: any) {
    if (newProps.presentationModeEnabled) {
      window.addEventListener('keydown', this.props.exitPresentationMode);
    } else {
      window.removeEventListener('keydown', this.props.exitPresentationMode);
    }
  }

  public componentDidMount() {
    this.props.applicationMountComplete();
  }

  public render() {
    const tabGroup1 = this.props.primaryEditor && (
      <div className={styles.mdiWrapper} key={'primaryEditor'}>
        <MDI owningEditor={Constants.EDITOR_KEY_PRIMARY} />
      </div>
    );

    const tabGroup2 =
      this.props.secondaryEditor && Object.keys(this.props.secondaryEditor.documents).length ? (
        <div className={`${styles.mdiWrapper} ${styles.secondaryMdi}`} key={'secondaryEditor'}>
          <MDI owningEditor={Constants.EDITOR_KEY_SECONDARY} />
        </div>
      ) : null;

    // If falsy children aren't filtered out, splitter won't recognize change in number of children
    // (i.e. [child1, child2] -> [false, child2] is still seen as 2 children by the splitter)
    // TODO: Move this logic to splitter-side
    const tabGroups = [tabGroup1, tabGroup2].filter(tG => !!tG);

    // Explorer & TabGroup(s) pane
    const workbenchChildren = [];

    if (this.props.explorerIsVisible && !this.props.presentationModeEnabled) {
      workbenchChildren.push(<ExplorerBar key={'explorer-bar'} />);
    }

    workbenchChildren.push(
      <Splitter orientation={'vertical'} key={'tab-group-splitter'} minSizes={{ 0: 160, 1: 160 }}>
        {tabGroups}
      </Splitter>
    );

    return (
      <>
        {(isWindows() || isLinux()) && <AppMenuContainer />}
        <div className={styles.main}>
          <div className={styles.nav}>
            {!this.props.presentationModeEnabled && (
              <NavBar selection={this.props.navBarSelection} explorerIsVisible={this.props.explorerIsVisible} />
            )}
            <main className={styles.workbench}>
              <Splitter
                orientation={'vertical'}
                primaryPaneIndex={0}
                minSizes={{ 0: 175, 1: 40 }}
                initialSizes={{ 0: 280 }}
                onSizeChange={this.checkExplorerSize}
              >
                {workbenchChildren}
              </Splitter>
            </main>
            <TabManagerContainer disabled={false} />
          </div>
          {!this.props.presentationModeEnabled && <StatusBar />}
          <DialogHostContainer />
          <StoreVisualizer enabled={false} />
        </div>
      </>
    );
  }

  /** Called when the splitter between the editor and explorer panes is moved */
  private checkExplorerSize(sizes: { absolute: number; percentage: number }[]): void {
    if (sizes.length) {
      const explorerSize = sizes[0];
      const minExplorerWidth = 175;
      if (explorerSize.absolute < minExplorerWidth) {
        store.dispatch(showExplorer(false));
      }
    }
  }
}
