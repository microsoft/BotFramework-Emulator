/* tslint:disable:max-line-length */
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

import { filterChildren, hmrSafeNameComparison } from '../../utils';
import * as styles from './expandCollapse.scss';

export interface ExpandCollapseProps {
  expanded?: boolean;
  title?: string;
  className?: string;
}

export interface ExpandCollapseState {
  expanded: boolean;
}

export class ExpandCollapse extends React.Component<ExpandCollapseProps, ExpandCollapseState> {
  constructor(props: ExpandCollapseProps) {
    super(props);
    this.state = { expanded: !!props.expanded };
  }

  render() {
    const { expanded } = this.state;
    const { className, title, children } = this.props;
    const toggleClassName = !expanded ? styles.toggle : `${styles.toggle} ${styles.toggleExpanded}`;

    // TODO: Consider <input type="checkbox"> instead of <div />
    return (
      <div aria-expanded={ expanded } className={ `${styles.expandCollapse} ${className}` }>
        <header>
          <div className={ styles.content } onClick={ this.handleTitleClick }>
            <span className={ toggleClassName }></span>
            { title }
          </div>
          <div className={ styles.accessories }>
            { filterChildren(children, child => hmrSafeNameComparison(child.type, ExpandCollapseControls)) }
          </div>
        </header>
        <div className={ styles.body }>
          {
            expanded &&
            <section className={ styles.shadow }>
              { filterChildren(children, child => hmrSafeNameComparison(child.type, ExpandCollapseContent)) }
            </section>
          }
        </div>
      </div>
    );
  }

  public componentWillReceiveProps(newProps: ExpandCollapseProps) {
    if (typeof newProps.expanded !== 'undefined') {
      const { expanded } = newProps;
      this.setState({ expanded });
    }
  }

  private handleTitleClick = () => {
    this.setState(state => ({ expanded: !state.expanded }));
  }
}

export const ExpandCollapseControls = props => props.children;
export const ExpandCollapseContent = props => props.children;
