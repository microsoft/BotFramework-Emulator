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
import { Activity } from 'botframework-schema';

import { ChatDocument } from '../../../../../state/reducers/chat';

import * as styles from './log.scss';
import { LogEntry } from './logEntryContainer';

export interface LogProps {
  document?: ChatDocument;
  documentId?: string;
}

export interface LogState {
  count: number;
  currentlyInspectedActivity: Activity | null;
  selectedActivity: Activity | null;
}

export class Log extends React.Component<LogProps, LogState> {
  public scrollMe: Element;

  constructor(props: LogProps, context: LogState) {
    super(props, context);
    this.state = {
      count: 0,
      currentlyInspectedActivity: null,
      selectedActivity: null,
    };
  }

  componentDidUpdate(): void {
    const { props, scrollMe, state } = this;
    const selectedActivity = this.props.document.inspectorObjects[0];
    // set up selected activity subscription once it's available
    if (selectedActivity) {
      const { showInInspector } = selectedActivity;
      const currentlyInspectedActivity = showInInspector ? selectedActivity : null;

      this.setState((prevState): any => {
        if (
          prevState.selectedActivity !== selectedActivity ||
          prevState.currentlyInspectedActivity !== currentlyInspectedActivity
        ) {
          return { currentlyInspectedActivity, selectedActivity };
        }
      });
    }
    if (props.document.log.entries.length !== state.count) {
      scrollMe.scrollTop = scrollMe.scrollHeight;
      this.setState({
        count: props.document.log.entries.length,
      });
    }
  }

  render() {
    let key = 0;
    return (
      <div className={styles.log} ref={ref => (this.scrollMe = ref)}>
        {this.props.document.log.entries.map(entry => (
          <LogEntry
            currentlyInspectedActivity={this.state.currentlyInspectedActivity}
            document={this.props.document}
            entry={entry}
            entryIndex={key + 1}
            key={`entry-${key++}`}
          />
        ))}
      </div>
    );
  }
}
