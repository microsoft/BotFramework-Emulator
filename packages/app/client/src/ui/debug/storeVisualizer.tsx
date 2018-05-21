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
import { css } from 'glamor';

import { IRootState } from '../../data/store';
import * as Constants from '../../constants';
import { PrimaryButton } from '@bfemulator/ui-react';

const CSS = css({
  position: 'absolute',
  maxWidth: '400px',
  display: 'flex',
  flexFlow: 'column nowrap',
  bottom: 0,
  left: 0,
  opacity: '0.9',
  pointerEvents: 'none',

  '& pre': {
    maxHeight: '500px',
    overflowY: 'auto',
    pointerEvents: 'auto'
  },

  '& select': {
    width: '120px'
  },

  '& select, & option': {
    pointerEvents: 'auto'
  },

  '& .visualizer-button': {
    width: '120px',
    pointerEvents: 'auto'
  }
});

type StateSlice = 'assetExplorer' | 'bot' | 'chat' | 'dialog' | 'editor' | 'explorer' | 'navBar' | 'presentation' | 'server';

interface StoreVisualizerProps {
  enabled?: boolean;
  rootState?: IRootState;
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
      selectedSlice: 'editor'
    };
  }

  toggleShowing(): void {
    this.setState({ showing: !this.state.showing });
  }

  onSelectSlice(e: any): void {
    this.setState({ selectedSlice: e.target.value });
  }

  render(): JSX.Element {
    const prettyState = JSON.stringify(this.props.rootState[this.state.selectedSlice], null, 2);

    if (this.props.enabled) {
      return (
        <div { ...CSS }>
          {
            this.state.showing ?

            <>
              <select value={ this.state.selectedSlice } onChange={ this.onSelectSlice } >
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

              <pre>
                { prettyState }
              </pre>

              <PrimaryButton text="Hide Visualizer" className="visualizer-button" onClick={ this.toggleShowing } />
            </>

            :

            <PrimaryButton text="Show visualizer" className="visualizer-button" onClick={ this.toggleShowing } />
          }
        </div>
      );
    } else return null;
  }
}

const mapStateToProps = (state: IRootState): StoreVisualizerProps => ({ rootState: state });

export const StoreVisualizer = connect(mapStateToProps, null)(StoreVisualizerComponent) as any;
