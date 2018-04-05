import * as React from 'react';
import { css } from 'glamor';

const CSS = css({
  display: 'flex',
  height: '64px',
  width: '400px',
  padding: '16px 0',
  justifyContent: 'space-between',

  '& > span': {
    display: 'inline-block',
    width: '32px',
    lineHeight: '32px',
    textAlign: 'center',
    cursor: 'pointer'
  },

  '& .play-icon': {
    backgroundImage: 'url(./external/media/ic_play.svg)',
    backgroundSize: '32px',
    BackgroundPosition: '50% 50%',
    backgroundRepeat: 'no-repeat'
  }
});

interface IPlaybackBarState {
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
 * */
export default class PlaybackBar extends React.Component<{}, IPlaybackBarState> {
  constructor(props, context) {
    super(props, context);

    this.onClickStartOver = this.onClickStartOver.bind(this);
    this.onClickStepBack = this.onClickStepBack.bind(this);
    this.onClickStepForward = this.onClickStepForward.bind(this);
    this.onClickJumpToEnd = this.onClickJumpToEnd.bind(this);
    this.onClickPlay = this.onClickPlay.bind(this);
    this.onClickPause = this.onClickPause.bind(this);

    this.state = { playing: false };
  }

  onClickStartOver(): void {}

  onClickStepBack(): void {}

  onClickStepForward(): void {}

  onClickJumpToEnd(): void {}

  onClickPlay(): void {
    this.setState({ playing: true });
  }

  onClickPause(): void {
    this.setState({ playing: false });
  }

  render(): JSX.Element {
    return (
      <div { ...CSS }>
        <span onClick={ this.onClickStartOver }>|&lt;&lt;</span>
        <span onClick={ this.onClickStepBack }>|&lt;</span>
        {
          this.state.playing ?
            <span onClick={ this.onClickPause }>||</span>
          :
            <span className="play-icon" onClick={ this.onClickPlay }></span>
        }
        <span onClick={ this.onClickStepForward }>&gt;|</span>
        <span onClick={ this.onClickJumpToEnd }>&gt;&gt;|</span>
      </div>
    );
  }
}
