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

import { mergeStyles } from '@uifabric/merge-styles';
import * as React from 'react';
import { connect } from 'react-redux';

import { Content as TabbedDocumentContent, Tab as TabbedDocumentTab, TabBar, TabBarTab } from './index';
import { filterChildren, hmrSafeNameComparison } from '@bfemulator/ui-react';
import { RootState } from '../../../data/store';

const css = mergeStyles({
  displayName: 'multiTabs',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  boxSizing: 'border-box'
});

interface MultiTabsProps {
  value?: number;
  owningEditor?: string;
  children?: any;
  presentationModeEnabled?: boolean;
  onChange?: (tabValue: any) => any;
}

class MultiTabsComponent extends React.Component<MultiTabsProps> {
  private readonly childRefs: HTMLElement[] = [];

  constructor(props: MultiTabsProps) {
    super(props);
  }

  render() {
    return (
      <div className={ css }>
        {
          !this.props.presentationModeEnabled &&
          <TabBar owningEditor={ this.props.owningEditor } childRefs={ this.childRefs }
                  activeIndex={ this.props.value }>
            {
              React.Children.map(this.props.children, (tabbedDocument: any, index) =>
                <TabBarTab onClick={ this.handleTabClick.bind(this, index) } setRef={ this.setRef }>
                  { filterChildren(tabbedDocument.props.children, child =>
                    hmrSafeNameComparison(child.type, TabbedDocumentTab)) }
                </TabBarTab>
              )
            }
          </TabBar>
        }
        {
          !!this.props.children.length && React.Children.map(
            this.props.children,
            (tabbedDocument: any, index: number) =>
              filterChildren(
                tabbedDocument.props.children,
                child => hmrSafeNameComparison(child.type, TabbedDocumentContent)
              ).map(child => child && React.cloneElement(child as any, { hidden: index !== this.props.value }))
          )
        }
      </div>
    );
  }

  private handleTabClick = (nextValue: any) => {
    if (this.props.onChange) {
      this.props.onChange(nextValue);
    }
  }

  private setRef = (input) => {
    this.childRefs.push(input);
  }
}

const mapStateToProps = (state: RootState): MultiTabsProps => ({
  presentationModeEnabled: state.presentation.enabled
});

export const MultiTabs = connect(mapStateToProps)(MultiTabsComponent) as any;
