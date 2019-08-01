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

import { PrimaryButton } from '@bfemulator/ui-react';
import * as React from 'react';
import { connect } from 'react-redux';

import { RootState } from '../../state/store';

import * as styles from './storeVisualizer.scss';

type StateSlice =
  | 'assetExplorer'
  | 'bot'
  | 'chat'
  | 'dialog'
  | 'editor'
  | 'explorer'
  | 'navBar'
  | 'presentation'
  | 'server';

interface StoreVisualizerProps {
  enabled?: boolean;
  rootState?: RootState;
}

interface StoreVisualizerState {
  showing?: boolean;
  selectedSlice?: StateSlice;
}

/** Transparent overlay that helps visualize a selected slice of the state */
class StoreVisualizerComponent extends React.Component<StoreVisualizerProps, StoreVisualizerState> {
  constructor(props: StoreVisualizerProps) {
    super(props);

    this.toggleShowing = this.toggleShowing.bind(this);
    this.onSelectSlice = this.onSelectSlice.bind(this);

    this.state = {
      showing: true,
      selectedSlice: 'editor',
    };
  }

  public toggleShowing(): void {
    this.setState({ showing: !this.state.showing });
  }

  public onSelectSlice(e: any): void {
    this.setState({ selectedSlice: e.target.value });
  }

  private get content(): JSX.Element {
    const { showing, selectedSlice } = this.state;
    const { rootState } = this.props;

    if (showing) {
      const prettyState = JSON.stringify(rootState[selectedSlice], null, 2);
      return (
        <>
          <select value={selectedSlice} onChange={this.onSelectSlice}>
            <option value="assetExplorer">Asset Explorer</option>
            <option value="bot">Bot</option>
            <option value="chat">Chat</option>
            <option value="dialog">Dialog</option>
            <option value="editor">Editor</option>
            <option value="explorer">Explorer</option>
            <option value="navBar">NavBar</option>
            <option value="presentation">Presentation</option>
            <option value="server">Server</option>
          </select>
          <pre>{prettyState}</pre>
          <PrimaryButton text="Hide Visualizer" className={styles.visualizerButton} onClick={this.toggleShowing} />
        </>
      );
    } else {
      return <PrimaryButton text="Show visualizer" className={styles.visualizerButton} onClick={this.toggleShowing} />;
    }
  }

  public render(): JSX.Element {
    return this.props.enabled ? <div className={styles.storeVisualizer}> {this.content}</div> : null;
  }
}

const mapStateToProps = (state: RootState): StoreVisualizerProps => ({
  rootState: state,
});

export const StoreVisualizer = connect(mapStateToProps)(StoreVisualizerComponent) as any;
