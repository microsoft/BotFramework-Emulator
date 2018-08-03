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
import * as styles from './log.scss';
import { Subscription } from 'rxjs';
import { ActivitySelectionFromLog } from './logEntry';
import { LogEntry } from './logEntryContainer';

export interface LogProps {
  document: any;
}

export interface LogState {
  count: number;
}

export class Log extends React.Component<LogProps, LogState> {
  public scrollMe: Element;
  public selectedActivitySubscription: Subscription;
  public selectedActivity: any;
  public currentlyInspectedActivity: any;

  constructor(props: LogProps, context: LogState) {
    super(props, context);
    this.state = {
      count: 0
    };
  }

  componentDidUpdate(): void {
    let { props, scrollMe, selectedActivitySubscription, state } = this;
    // set up selected activity subscription once it's available
    if (props.document && props.document.selectedActivity$ && !selectedActivitySubscription) {
      selectedActivitySubscription =
        props.document.selectedActivity$.subscribe(obj => {
          if (obj) {
            if (obj.activity) {
              // this activity came from webchat (activities from webchat are wrapped)
              // ex: { activity: { id: , from: , ... } }
              const { activity } = obj;
              this.selectedActivity = activity;
              this.currentlyInspectedActivity = activity;
            } else {
              // this activity came from the log (activities from the log are raw)
              // ex: { id: , from: , to: , ... }
              const activity = obj;
              this.selectedActivity = activity;
              const { fromLog = {} as ActivitySelectionFromLog }: { fromLog: ActivitySelectionFromLog } = activity;
              // check if it was clicked or hovered
              const { clicked } = fromLog;
              if (clicked) {
                this.currentlyInspectedActivity = activity;
              }
            }
          }
        });
    }
    if (props.document.log.entries.length !== state.count) {
      scrollMe.scrollTop = scrollMe.scrollHeight;
      this.setState({
        count: props.document.log.entries.length
      });
    }
  }

  componentWillUnmount(): void {
    // clean up activity subscription
    if (this.selectedActivitySubscription) {
      this.selectedActivitySubscription.unsubscribe();
    }
  }

  render() {
    let key = 0;
    return (
      <div className={ styles.log } ref={ ref => this.scrollMe = ref }>
        {
          this.props.document.log.entries.map(entry =>
            <LogEntry key={ `entry-${key++}` } entry={ entry } document={ this.props.document }
              selectedActivity={ this.selectedActivity }
              currentlyInspectedActivity={ this.currentlyInspectedActivity } />
          )
        }
      </div>
    );
  }
}
