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

import * as styles from './PhrasingsView.scss';

interface PhrasingsViewProps {
  phrasings: string[];
  addPhrasing: (phrase: string) => void;
  removePhrasing: (phrase: string) => void;
}

export default class PhrasingsView extends Component<PhrasingsViewProps, {}> {
  constructor(props: PhrasingsViewProps, context: any) {
    super(props, context);
  }

  public render(): JSX.Element {
    const phrasingsElems: JSX.Element[] = this.props.phrasings.map((phrasing, index) =>
      this.renderPhrasing(phrasing, index !== 0)
    );
    return (
      <div className={styles.questionColumn}>
        <h3>Alternative phrasing</h3>
        {phrasingsElems}
        <input id="phrasing-input" placeholder="Add alternative here" onKeyPress={e => this.phraseInputKeyPress(e)} />
        <button id="add-phrase-btn" className={styles.plusBtn} onClick={() => this.handleAddPhraseClick()} />
      </div>
    );
  }

  private renderPhrasing(phrasing: string, allowRemove: boolean): JSX.Element {
    return (
      <div className={styles.phrasingBlock} key={phrasing}>
        {phrasing}
        {allowRemove ? <button className={styles.closeBtn} onClick={() => this.removePhrasing(phrasing)} /> : null}
      </div>
    );
  }

  private phraseInputKeyPress(e: any) {
    if (e.key === 'Enter') {
      this.handleAddPhraseClick();
    }
  }

  private handleAddPhraseClick() {
    const newPhrase = (document.getElementById('phrasing-input') as HTMLInputElement).value;
    if (newPhrase) {
      this.props.addPhrasing(newPhrase);
      (document.getElementById('phrasing-input') as HTMLInputElement).value = '';
    }
  }

  private removePhrasing(phrase: string) {
    this.props.removePhrasing(phrase);
  }
}
