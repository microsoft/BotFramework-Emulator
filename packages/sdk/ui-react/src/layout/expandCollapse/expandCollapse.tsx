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
import { KeyboardEvent } from 'react';

import { filterChildren, hmrSafeNameComparison } from '../../utils';

import * as styles from './expandCollapse.scss';

export interface ExpandCollapseProps {
  expanded?: boolean;
  title?: string;
  className?: string;
  ariaLabel?: string;
}

export interface ExpandCollapseState {
  expanded: boolean;
}

export const ExpandCollapseControls = props => props.children;
export const ExpandCollapseContent = props => props.children;

export class ExpandCollapse extends React.Component<ExpandCollapseProps, ExpandCollapseState> {
  public constructor(props: ExpandCollapseProps) {
    super(props);
    this.state = { expanded: !!props.expanded };
  }

  public render() {
    const { expanded } = this.state;
    const { className = '', title, children, ariaLabel } = this.props;
    const { toggleIcon, onHeaderKeyPress, onToggleExpandedButtonClick } = this;

    return (
      <div className={`${styles.expandCollapse} ${className} ${expanded ? 'expanded' : ''}`}>
        <div
          aria-expanded={expanded}
          aria-label={ariaLabel}
          role="toolbar"
          tabIndex={0}
          onKeyPress={onHeaderKeyPress}
          className={styles.header}
        >
          {toggleIcon}
          <h3 onClick={onToggleExpandedButtonClick} title={title}>
            {title}
          </h3>
          <div className={styles.accessories}>
            {filterChildren(children, child => hmrSafeNameComparison(child.type, ExpandCollapseControls))}
          </div>
        </div>
        <div className={styles.body}>
          {expanded && filterChildren(children, child => hmrSafeNameComparison(child.type, ExpandCollapseContent))}
        </div>
      </div>
    );
  }

  private get toggleIcon(): JSX.Element {
    if (this.state.expanded) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" aria-hidden={true}>
          <path d="M11 10.07H5.344L11 4.414v5.656z" />
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" aria-hidden={true}>
        <path d="M6 4v8l4-4-4-4zm1 2.414L8.586 8 7 9.586V6.414z" />
      </svg>
    );
  }

  public componentWillReceiveProps(newProps: ExpandCollapseProps) {
    if (typeof newProps.expanded !== 'undefined') {
      const { expanded } = newProps;
      this.setState({ expanded });
    }
  }

  private onToggleExpandedButtonClick = () => {
    this.setState(state => ({ expanded: !state.expanded }));
  };

  private onHeaderKeyPress = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === ' ') {
      this.onToggleExpandedButtonClick();
    }
  };
}
