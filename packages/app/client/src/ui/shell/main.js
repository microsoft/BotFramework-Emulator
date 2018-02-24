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
import React from 'react';
import PropTypes from 'prop-types';

import * as Colors from '../styles/colors';
import ExplorerBar from './explorer';
import * as Fonts from '../styles/fonts';
import MDI from './mdi';
import NavBar from './navBar';
import Splitter from '../layout/splitter-v2';
import TabManager from '../dialogs/tabManager';
import * as Constants from '../../constants';
import StatusBar from './statusBar';

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
  flexDirection: 'column',
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

export class Main extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleTabChange = this.handleTabChange.bind(this);

    this.state = {
      tabValue: 0
    };
  }

  handleTabChange(nextTabValue) {
    this.setState(() => ({ tabValue: nextTabValue }));
  }

  render() {
    const primaryEditor = this.props.primaryEditor &&
      <div className="mdi-wrapper" key={ 'primaryEditor' } ><MDI owningEditor={ Constants.EditorKey_Primary } /></div>;

    const secondaryEditor = this.props.secondaryEditor && this.props.secondaryEditor.documents.length ?
      <div className="mdi-wrapper secondary-mdi" key={ 'secondaryEditor' } ><MDI owningEditor={ Constants.EditorKey_Secondary } /></div> : null;

    return (
      <div className={ CSS }>
        <div className={ NAV_CSS }>
        <NavBar/>
        <div className="workbench">
          <Splitter orientation={ 'vertical' } primaryPaneIndex={ 0 } minSizes={{ 0: 40, 1: 40 }} initialSizes={{ 0: 300 }}>
            <ExplorerBar />
            <Splitter orientation={ 'vertical' }>
            {
              [primaryEditor, secondaryEditor].filter(elem => !!elem)
            }
            </Splitter>
          </Splitter>
        </div>
        <TabManager disabled={ false } />
      </div>
      <StatusBar />
      </div>
    );
  }
}

export default connect((state, ownProps) => ({
  primaryEditor: state.editor.editors[Constants.EditorKey_Primary],
  secondaryEditor: state.editor.editors[Constants.EditorKey_Secondary]
}))(Main);

Main.propTypes = {
  primaryEditor: PropTypes.object,
  secondaryEditor: PropTypes.object
};
