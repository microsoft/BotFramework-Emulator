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

import { css } from 'glamor';
import * as React from 'react';
import { filterChildren, hmrSafeNameComparison } from '@bfemulator/ui-react';

const CSS = css({
  padding: '8px 16px',
  display: 'flex',
  flexFlow: 'row nowrap',
  alignItems: 'center',
  flexShrink: 0,

  '& > header': {
    fontSize: '13px',
    lineHeight: '24px',
    height: '24px',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },

  '& > span.accessory': {
    display: 'inline-block',
    marginLeft: 'auto',
    width: '24px',
    height: '24px',
    cursor: 'pointer'
  },

  '& > span.bot-settings-icon': {
    background: 'url("./external/media/ic_settings.svg") no-repeat 50% 50%',
    backgroundSize: '16px',
  }
});

export class ExplorerBarHeader extends React.Component {
  render() {
    return (
      <div { ...CSS }>
        <header>
          { filterChildren(this.props.children, child => hmrSafeNameComparison(child.type, Title)) }
        </header>
        { filterChildren(this.props.children, child => hmrSafeNameComparison(child.type, Accessories)) }
      </div>
    );
  }
}

export const Title = props => props.children;
export const Accessories = props => props.children;
