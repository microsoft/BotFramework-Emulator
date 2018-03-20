import * as React from 'react';
import { connect } from 'react-redux';
import { css } from 'glamor';

import { IRootState } from '../../data/store';
import * as Constants from '../../constants';
import PrimaryButton from '../widget/primaryButton';

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

type StateSlice = 'assetExplorer' | 'bot' | 'dialog' | 'editor' | 'explorer' | 'navBar' | 'server';

interface IStoreVisualizerProps {
  enabled?: boolean;
  rootState?: IRootState;
}

interface IStoreVisualizerState {
  showing?: boolean;
  selectedSlice?: StateSlice;
}

/** Transparent overlay that helps visualize a selected slice of the state */
class StoreVisualizer extends React.Component<IStoreVisualizerProps, IStoreVisualizerState> {
  constructor(context, props) {
    super(context, props);

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
                <option value="dialog">Dialog</option>
                <option value="editor">Editor</option>
                <option value="explorer">Explorer</option>
                <option value="navBar">NavBar</option>
                <option value="server">Server</option>
              </select>

              <pre>
                { prettyState }
              </pre>

              <PrimaryButton text="Hide Visualizer" className='visualizer-button' onClick={ this.toggleShowing } />
            </>

            :

            <PrimaryButton text="Show visualizer" className='visualizer-button' onClick={ this.toggleShowing } />
          }
        </div>
      );
    } else return null;
  }
}

const mapStateToProps = (state: IRootState): IStoreVisualizerProps => ({ rootState: state });

export default connect(mapStateToProps, null)(StoreVisualizer);
