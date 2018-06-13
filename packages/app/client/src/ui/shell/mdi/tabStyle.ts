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

import { IStyle } from '@uifabric/merge-styles';
import { ThemeVariables } from '@bfemulator/ui-react';

export const TAB_CSS: IStyle = {
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  border: 'none',
  borderRight: `1px solid ${ThemeVariables.neutral15}`,
  backgroundColor: `${ThemeVariables.neutral15}`,
  color: `${ThemeVariables.neutral7}`,
  cursor: 'pointer',
  padding: '4px 8px',
  boxSizing: 'border-box',
  whiteSpace: 'nowrap',
  selectors: {
    '&.active-editor-tab': {
      backgroundColor: `${ThemeVariables.neutral15}`,
      color: `${ThemeVariables.neutral1}`,
      selectors: {
        '& > span.editor-tab-close': {
          opacity: 1
        }
      }
    },

    '&.dragged-over-editor-tab': {
      backgroundColor: `${ThemeVariables.neutral14}`
    },

    ':hover': {
      selectors: {
        '& > span.editor-tab-close': {
          opacity: 1
        }
      }
    },

    '& > span': {
      display: 'inline-block',
      height: 'auto'
    },

    '& > span.editor-tab-icon': {
      display: 'inline-block',
      width: '12px',
      marginRight: '8px',
      selectors: {
        '::after': {
          content: '🗋',
          color: `${ThemeVariables.warningOutline}`,
          fontSize: '16px',
        }
      }
    },

    '& > span.editor-tab-close': {
      display: 'inline-block',
      width: '8px',
      marginLeft: '8px',
      opacity: 0,
      selectors: {
        '::after': {
          content: '✖',
          color: `${ThemeVariables.neutral5}`,
          fontSize: '12px'
        }
      }
    },

    '& .truncated-tab-text': {
      maxWidth: '200px'
    }
  }
};
