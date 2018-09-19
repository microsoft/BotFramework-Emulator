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
import { RootState } from '../../../../data/store';
import { Editor } from '../../../../data/reducer/editor';
import * as Constants from '../../../../constants';
import * as styles from '../../main.scss';
import { MDI } from '../../mdi';
import { Splitter } from '@bfemulator/ui-react';

export interface TabGroupsProps {
  primaryEditor: Editor;
  secondaryEditor: Editor;
}

class TabGroupsComponent extends React.Component<TabGroupsProps, {}> {
  constructor(props: TabGroupsProps) {
    super(props);
  }

  render(): JSX.Element {
    const tabGroup1 = this.props.primaryEditor &&
      <div className={ styles.mdiWrapper } key={ 'primaryEditor' }>
        <MDI owningEditor={ Constants.EDITOR_KEY_PRIMARY }/>
      </div>;

    const tabGroup2 = this.props.secondaryEditor && Object.keys(this.props.secondaryEditor.documents).length ?
      <div className={ `${styles.mdiWrapper} ${styles.secondaryMdi}` } key={ 'secondaryEditor' }>
        <MDI owningEditor={ Constants.EDITOR_KEY_SECONDARY }/>
      </div>
      : null;

    const tabGroups = [tabGroup1, tabGroup2].filter(tg => !!tg);

    return (
      <Splitter orientation={ 'vertical' } key={ 'tab-group-splitter' } minSizes={ { 0: 160, 1: 160 } }>
        { tabGroups }
      </Splitter>
    );
  }
}

function mapStateToProps(state: RootState): TabGroupsProps {
  return {
    primaryEditor: state.editor.editors[Constants.EDITOR_KEY_PRIMARY],
    secondaryEditor: state.editor.editors[Constants.EDITOR_KEY_SECONDARY]
  };
}

export const TabGroups = connect(mapStateToProps, null)(TabGroupsComponent);
