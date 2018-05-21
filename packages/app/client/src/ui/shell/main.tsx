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

import { connect } from 'react-redux';
import { css } from 'glamor';
import * as React from 'react';

import { Colors, Fonts, Splitter } from '@bfemulator/ui-react';
import ExplorerBar from './explorer';
import { MDI } from './mdi';
import { NavBar } from './navBar';
import { TabManager, DialogHost } from '../dialogs';
import * as Constants from '../../constants';
import { StatusBar } from './statusBar';
import { StoreVisualizer } from '../debug/storeVisualizer';
import store from '../../data/store';
import { KeyCodes } from '@uifabric/utilities/lib';
import * as PresentationActions from '../../data/action/presentationActions';
import { IEditor } from '../../data/reducer/editor';
import { IRootState } from '../../data/store';

css.global('html, body, #root', {
  backgroundColor: Colors.APP_BACKGROUND_DARK,
  cursor: 'default',
  fontFamily: Fonts.FONT_FAMILY_DEFAULT,
  fontSize: '13px',
  height: '100%',
  margin: 0,
  minHeight: '100%',
  overflow: 'hidden',
  userSelect: 'none',
});

css.global('div', {
  boxSizing: 'border-box',
});

css.global('::-webkit-scrollbar', {
  width: '10px',
  height: '10px',
});

css.global('::-webkit-scrollbar-track', {
  background: Colors.SCROLLBAR_TRACK_BACKGROUND_DARK,
});

css.global('::-webkit-scrollbar-thumb', {
  background: Colors.SCROLLBAR_THUMB_BACKGROUND_DARK,
});

const CSS = css({
  backgroundColor: Colors.APP_BACKGROUND_DARK,
  color: Colors.APP_FOREGROUND_DARK,
  display: 'flex',
  width: '100%',
  height: '100%',
  minHeight: '100%',
  flexDirection: 'column'
});

const NAV_CSS = css({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  height: '100%',

  '& > .workbench': {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },

  '& .mdi-wrapper': {
    height: '100%',
    width: '100%',
  },

  '& .secondary-mdi': {
    borderLeft: `1px solid ${Colors.C3}`
  }
});

interface MainProps {
  primaryEditor?: IEditor;
  secondaryEditor?: IEditor;
  showingExplorer?: boolean;
  presentationModeEnabled?: boolean;
  navBarSelection?: string;
  exitPresentationMode?: (e) => void;
}

interface MainState {
  tabValue: number;
}

class Main extends React.Component<MainProps, MainState> {
  constructor(props: MainProps) {
    super(props);

    this.handleTabChange = this.handleTabChange.bind(this);

    this.state = {
      tabValue: 0
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.presentationModeEnabled) {
      window.addEventListener("keydown", this.props.exitPresentationMode);
    } else {
      window.removeEventListener("keydown", this.props.exitPresentationMode);
    }
  }

  handleTabChange(nextTabValue) {
    this.setState(() => ({ tabValue: nextTabValue }));
  }

  render() {
    const tabGroup1 = this.props.primaryEditor &&
      <div className="mdi-wrapper" key={ 'primaryEditor' } ><MDI owningEditor={ Constants.EditorKey_Primary } /></div>;

    const tabGroup2 = this.props.secondaryEditor && Object.keys(this.props.secondaryEditor.documents).length ?
      <div className="mdi-wrapper secondary-mdi" key={ 'secondaryEditor' } ><MDI owningEditor={ Constants.EditorKey_Secondary } /></div> : null;

    // If falsy children aren't filtered out, splitter won't recognize change in number of children
    // (i.e. [child1, child2] -> [false, child2] is still seen as 2 children by the splitter)
    // TODO: Move this logic to splitter-side
    const tabGroups = [tabGroup1, tabGroup2].filter(tG => !!tG);

    // Explorer & TabGroup(s) pane
    const workbenchChildren = [];

    if (this.props.showingExplorer && !this.props.presentationModeEnabled)
      workbenchChildren.push(<ExplorerBar key={ 'explorer-bar' } />);

    workbenchChildren.push(
      <Splitter orientation={ 'vertical' } key={ 'tab-group-splitter' }>
        {tabGroups}
      </Splitter>
    );

    return (
      <div { ...CSS }>
        <div { ...NAV_CSS }>
          { !this.props.presentationModeEnabled && <NavBar selection={ this.props.navBarSelection } showingExplorer={ this.props.showingExplorer } /> }
          <div className="workbench">
            <Splitter orientation={ 'vertical' } primaryPaneIndex={ 0 } minSizes={{ 0: 40, 1: 40 }} initialSizes={{ 0: 210 }}>
              { workbenchChildren }
            </Splitter>
          </div>
          <TabManager disabled={ false } />
        </div>
        { !this.props.presentationModeEnabled && <StatusBar /> }
        <DialogHost />
        <StoreVisualizer enabled={ false } />
      </div>
    );
  }
}

const mapStateToProps = (state: IRootState): MainProps => ({
  presentationModeEnabled: state.presentation.enabled,
  primaryEditor: state.editor.editors[Constants.EditorKey_Primary],
  secondaryEditor: state.editor.editors[Constants.EditorKey_Secondary],
  showingExplorer: state.explorer.showing,
  navBarSelection: state.navBar.selection
});

const mapDispatchToProps = (dispatch): MainProps => ({
  exitPresentationMode: (e) => {
    if (e.keyCode === KeyCodes.escape) {
      dispatch(PresentationActions.disable());
    }
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);
