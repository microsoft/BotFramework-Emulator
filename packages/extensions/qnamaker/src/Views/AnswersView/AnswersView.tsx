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

import { Answer } from '../../Models/QnAMakerModels';

import * as styles from './AnswersView.scss';

interface AnswersViewProps {
  answers: Answer[];
  selectedAnswer: Answer | null;
  selectAnswer: (answer: Answer) => void;
  addAnswer: (answer: string) => void;
}

export default class AnswersView extends Component<AnswersViewProps, {}> {
  constructor(props: AnswersViewProps, context: any) {
    super(props, context);
  }

  public render(): JSX.Element {
    const answersRendered: JSX.Element[] = this.props.answers.map(answer => this.renderAnswer(answer));
    return (
      <div className={`${styles.answersColumn} answers-column`}>
        <h3>Answer</h3>
        <p>Choose the most appropriate answer:</p>
        {answersRendered}
        <input
          type="text"
          id="new-answer"
          placeholder="Enter a new answer here"
          onKeyPress={e => this.answerInputKeyPress(e)}
        />
      </div>
    );
  }

  private renderAnswer(answer: Answer) {
    const selected = this.props.selectedAnswer !== null && answer.text === this.props.selectedAnswer.text;
    let blockClass = 'answer-block';
    if (selected) {
      blockClass += ' selected';
    }
    const selectedBlock = selected ? (
      <div className={styles.selected}>
        <h4>Confidence score</h4>
        <p>{answer.score.toFixed(2)}</p>
      </div>
    ) : null;
    return (
      <div className="qna-answer" key={answer.text}>
        <button className={`${styles.answersBlock} ${blockClass}`} onClick={() => this.props.selectAnswer(answer)}>
          {answer.text}
        </button>
        {selectedBlock}
      </div>
    );
  }

  private answerInputKeyPress(e: any) {
    if (e.key === 'Enter') {
      this.props.addAnswer(e.target.value);
      e.target.value = '';
    }
  }
}
