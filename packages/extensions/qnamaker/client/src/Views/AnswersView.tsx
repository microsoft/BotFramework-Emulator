import * as React from 'react';
import { css } from 'glamor';
import { Colors, Fonts } from '@bfemulator/ui-react';
import { Component } from 'react';
import { Answer } from '../Models/QnAMakerModels';

const AnswerColumnCSS = css({
  paddingRight: '6px',
  overflowY: 'auto',
  height: '100%',
  padding: '0px 20px',
  fontFamily: Fonts.FONT_FAMILY_DEFAULT,

  '& input': {
    marginTop: '5px',
    background: 'transparent',
    width: '100%',
    borderRadius: '2px',
    border: 'solid 1px #777',
    padding: '4px 9px',
    color: 'white',
    boxSizing: 'border-box'
  }
});

const AnswerBlockCSS = css({
  borderRadius: '2px',
  border: 'solid 1px #777',
  backgroundColor: 'transparent',
  color: 'white',
  lineHeight: 1.38,
  whiteSpace: 'normal',
  textAlign: 'left',
  fontSize: '13px',
  padding: '5px',
  cursor: 'pointer',
  margin: '5px 0px',
  width: '100%',

  '.selected': {
    backgroundColor: '#1177bb',
    borderColor: '#1177bb',
  },

  ':focus': {
    outline: 'none'
  }, 
  ':hover': {
    borderColor: '#1177bb',
  }
});

const AnswerSelectedCSS = css({
  fontFamily: 'Segoe UI',

  '& h4': {
    marginTop: '10px',
    marginBottom: '0px'
  },
  '& p': {
    marginTop: '0px'
  }
});

interface AnswersViewProps {
  answers: Answer[];
  selectedAnswer: string;
  selectAnswer: (answer: string) => void;
  addAnswer: (answer: string) => void;
}

export default class AnswersView extends Component<AnswersViewProps, {}> {
  constructor(props: AnswersViewProps, context: any) {
    super(props, context);
  }

  render(): JSX.Element {
    let answersRendered: JSX.Element[] = this.props.answers.map((answer) => this.renderAnswer(answer));
    return (
      <div {...AnswerColumnCSS} className="answers-column">
        <h3>Answer</h3>
        <p>Choose the most appropriate answer:</p>
        {answersRendered}
        <input 
          type="text" 
          id="new-answer" 
          placeholder="Enter a new answer here" 
          onKeyPress={(e) => this.answerInputKeyPress(e)}
        />
      </div>
    );
  }

  private renderAnswer(answer: Answer) {
    let selected = answer.text === this.props.selectedAnswer;
    let blockClass = 'answer-block';
    if (selected) {
      blockClass += ' selected';
    }
    let selectedBlock = selected
      ? (
        <div {...AnswerSelectedCSS}>
          <h4>Confidence score</h4>
          <p>{answer.score.toFixed(2)}</p>
        </div>
      )
      : null;
    return (
      <div className="qna-answer" key={answer.text}>
        <button {...AnswerBlockCSS} className={blockClass} onClick={() => this.props.selectAnswer(answer.text)}>
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