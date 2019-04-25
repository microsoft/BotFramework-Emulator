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
import { mount, ReactWrapper } from 'enzyme';
import * as React from 'react';

import { WelcomePage } from '../welcomePage/welcomePage';

import { MarkdownPage, MarkdownPageProps } from './markdownPage';

describe('The Markdown page', () => {
  let parent: ReactWrapper;
  let instance: WelcomePage;
  const render = (props: MarkdownPageProps) => {
    parent = mount<MarkdownPage>(<MarkdownPage {...props} />);
    instance = parent.instance() as WelcomePage;
  };

  it('should render markdown when the user is online', () => {
    render({ onLine: true, markdown: '# markdown!' });
    const divHtml = parent.html();
    expect(divHtml).toBe('<div class="undefined "><div><div><h1>markdown!</h1>\n</div></div></div>');
  });

  it('should render offline content when the user is offline', () => {
    render({ onLine: false, markdown: '' });
    const divHtml = parent.html();
    expect(divHtml).toBe(
      '<div class="undefined "><div><div><h1>No Internet Connection</h1>try:<ul><li>Checking the network cables, model or router</li><li>Reconnecting to Wi-Fi</li></ul></div></div></div>'
    );
  });

  it('should not update unless the props have changed and have different values', () => {
    render({ onLine: true, markdown: '# markdown!' });
    const props = { ...instance.props };
    expect(instance.shouldComponentUpdate(props, {}, {})).toBe(false);
  });

  it('should render the "invalid markdown" message when invalid markdown is provided', () => {
    render({ onLine: true, markdown: [] as any });
    const divHtml = parent.html();
    expect(divHtml).toBe('<div class="undefined "><div><div># Error - Invalid markdown document</div></div></div>');
  });
});
