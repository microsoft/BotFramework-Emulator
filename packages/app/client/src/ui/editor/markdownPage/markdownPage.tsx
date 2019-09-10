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
import { Component } from 'react';
import MarkdownIt from 'markdown-it';

import { GenericDocument } from '../../layout';

import * as styles from './markdownPage.scss';

export interface MarkdownPageProps {
  markdown: string;
  onLine: boolean;
}

export class MarkdownPage extends Component<MarkdownPageProps> {
  private static markdownRenderer = new MarkdownIt();

  private static renderMarkdown(markdown: string) {
    try {
      return this.markdownRenderer.render(markdown);
    } catch (e) {
      return '# Error - Invalid markdown document';
    }
  }

  private static get offlineElement(): JSX.Element {
    return (
      <div className={styles.offline}>
        <h1>No Internet Connection</h1>
        try:
        <ul>
          <li>Checking the network cables, model or router</li>
          <li>Reconnecting to Wi-Fi</li>
        </ul>
      </div>
    );
  }

  public shouldComponentUpdate(nextProps: Readonly<MarkdownPageProps> = {} as MarkdownPageProps): boolean {
    const props = this.props || ({} as MarkdownPageProps);
    return props.markdown !== nextProps.markdown || props.onLine !== nextProps.onLine;
  }

  public render() {
    const children = !this.props.onLine ? (
      MarkdownPage.offlineElement
    ) : (
      <div
        className={styles.markdownContainer}
        dangerouslySetInnerHTML={{ __html: MarkdownPage.renderMarkdown(this.props.markdown) }}
      />
    );
    return <GenericDocument>{children}</GenericDocument>;
  }
}
