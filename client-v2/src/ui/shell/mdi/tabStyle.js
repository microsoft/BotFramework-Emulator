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

import { css } from 'glamor';

import * as Colors from '../../styles/colors';

export const TAB_CSS = css({
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    border: 'none',
    borderRight: `1px solid ${Colors.EDITOR_TAB_BORDER_DARK}`,
    backgroundColor: Colors.EDITOR_TAB_INACTIVE_BACKGROUND_DARK,
    color: Colors.EDITOR_TAB_INACTIVE_FOREGROUND_DARK,
    cursor: 'pointer',
    padding: '4px 8px',
    boxSizing: 'border-box',
    whiteSpace: 'nowrap',

    '&.active-editor-tab': {
        backgroundColor: Colors.EDITOR_TAB_ACTIVE_BACKGROUND_DARK,
        color: Colors.EDITOR_TAB_ACTIVE_FOREGROUND_DARK,

        '& > span.editor-tab-close': {
            opacity: 1
        }
    },

    '&:hover': {
        '& > span.editor-tab-close': {
            opacity: 1
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

        '&:after': {
            content: 'JS',
            color: Colors.YELLOW_1,
            fontSize: '10px'
        }
    },

    '& > span.editor-tab-close': {
        display: 'inline-block',
        width: '8px',
        marginLeft: '8px',
        opacity: 0,

        '&:after': {
            content: 'X',
            color: Colors.GRAY_1,
            fontSize: '12px'
        }
    }
});
