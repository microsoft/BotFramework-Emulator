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
import * as styles from './main.scss';
import { NavBar } from './navBar';
import { DialogHost, TabManagerContainer } from '../dialogs';
import { StatusBar } from './statusBar/statusBar';
import { StoreVisualizer } from '../debug/storeVisualizer';
import { Editor } from '../../data/reducer/editor';
import { WorkBench } from './workbench';

export interface MainProps {
  primaryEditor?: Editor;
  secondaryEditor?: Editor;
  presentationModeEnabled?: boolean;
  navBarSelection?: string;
  exitPresentationMode?: (e: Event) => void;
}

export interface MainState {
  tabValue: number;
}

export class Main extends React.Component<MainProps, MainState> {
  constructor(props: MainProps) {
    super(props);

    this.state = {
      tabValue: 0
    };
  }

  componentWillReceiveProps(newProps: any) {
    if (newProps.presentationModeEnabled) {
      window.addEventListener('keydown', this.props.exitPresentationMode);
    } else {
      window.removeEventListener('keydown', this.props.exitPresentationMode);
    }
  }

  render() {
    return (
      <div className={ styles.main }>
        <div className={ styles.nav }>
          { !this.props.presentationModeEnabled &&
          <NavBar selection={ this.props.navBarSelection }/> }
          <WorkBench/>
          <TabManagerContainer disabled={ false }/>
        </div>
        { !this.props.presentationModeEnabled && <StatusBar/> }
        <DialogHost/>
        <StoreVisualizer enabled={ false }/>
      </div>
    );
  }
}
