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

import * as styles from './playbackBar.scss';

interface PlaybackBarState {
  playing?: boolean;
}

/**
 * TODO: This component is purely visual at the moment until the playback functionality is fleshed out.
 * Still need to decide whether 'playing' state will be fed in via props, or contained within the playback bar
 * component, same with callbacks for buttons: Should the playback bar just be fed the document and conversation id
 * and perform actions based on that, or simply be a dumb component whose functionality is determined by the parent
 * component? (index.tsx in this case)
 *
 * Also needs icons
 */
export default class PlaybackBar extends React.Component<{}, PlaybackBarState> {
  constructor(props: {}, context: PlaybackBarState) {
    super(props, context);

    this.onClickStartOver = this.onClickStartOver.bind(this);
    this.onClickStepBack = this.onClickStepBack.bind(this);
    this.onClickStepForward = this.onClickStepForward.bind(this);
    this.onClickJumpToEnd = this.onClickJumpToEnd.bind(this);
    this.onClickPlay = this.onClickPlay.bind(this);
    this.onClickPause = this.onClickPause.bind(this);

    this.state = { playing: false };
  }

  public onClickStartOver(): void {
    return null;
  }

  public onClickStepBack(): void {
    return null;
  }

  public onClickStepForward(): void {
    return null;
  }

  public onClickJumpToEnd(): void {
    return null;
  }

  public onClickPlay(): void {
    this.setState({ playing: true });
  }

  public onClickPause(): void {
    this.setState({ playing: false });
  }

  public render(): JSX.Element {
    return (
      <div className={styles.playbackBar}>
        <span onClick={this.onClickStartOver}>|&lt;&lt;</span>
        <span onClick={this.onClickStepBack}>|&lt;</span>
        {this.state.playing ? (
          <span onClick={this.onClickPause}>||</span>
        ) : (
          <span className={styles.playIcon} onClick={this.onClickPlay} />
        )}
        <span onClick={this.onClickStepForward}>&gt;|</span>
        <span onClick={this.onClickJumpToEnd}>&gt;&gt;|</span>
      </div>
    );
  }
}
