import * as React from 'react';
import { css } from 'glamor';

import { TruncateText } from '../layout';
import * as Fonts from '../styles/fonts';
import * as Colors from '../styles/colors';

const CSS = css({
  position: 'relative',
  display: 'flex',
  flexFlow: 'column nowrap',
  width: '100%',
  paddingBottom: '24px',
  fontFamily: Fonts.FONT_FAMILY_DEFAULT,

  '& > *': {
    flexShrink: 0
  },

  '& > input': {
    height: '32px',
    padding: '4px 8px',
    boxSizing: 'border-box',
    width: '100%'
  },

  '& > .text-input-label': {
    fontSize: '12px',
    height: '16px',
    lineHeight: '16px',
    marginBottom: '8px'
  },

  '& > .text-input-err': {
    position: 'absolute',
    left: '8px',
    bottom: '4px',
    lineHeight: '16px',
    height: '24px',
    color: Colors.INPUT_ERR_FOREGROUND_DARK,
    opacity: 0,
    pointerEvents: 'none',
    transition: 'all 0.5s ease-in-out',

    '&.error-showing': {
      opacity: 1
    },

    '& > .text-input-err-caret': {
      display: 'inline-block',
      position: 'absolute',
      top: '-4px',
      left: '20px',
      width: '8px',
      height: '8px',
      backgroundColor: Colors.INPUT_ERR_BACKGROUND_DARK,
      transform: 'rotateZ(45deg)'
    },

    '& > .text-input-err-msg': {
      display: 'inline-block',
      backgroundColor: Colors.INPUT_ERR_BACKGROUND_DARK,
      padding: '4px 8px',
      borderRadius: '4px',

      '& > span': {
        display: 'inline-block',
        height: '16px',
        width: '16px',
        marginRight: '4px',
        borderRadius: '16px',
        backgroundColor: Colors.INPUT_ERR_FOREGROUND_DARK,
        textAlign: 'center',

        '&:after': {
          height: '16px',
          content: '!',
          color: Colors.INPUT_ERR_BACKGROUND_DARK,
        }
      }
    }
  }
});

type TextInputType = 'text' | 'password';

interface ITextInputFieldProps {
  className?: string;
  error?: string;
  inputClass?: string;
  label?: string;
  onChange?: (e: any, ...args: any[]) => any;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  type?: TextInputType;
  value?: string;
}

export default class TextInputField extends React.Component<ITextInputFieldProps, {}> {
  constructor(props: ITextInputFieldProps, context: any) {
    super(props, context);
  }

  render(): JSX.Element {
    return (
      <div className={ 'text-input-comp ' + (this.props.className || '') } { ...CSS }>
        { this.props.label ? <TruncateText className="text-input-label">{ this.props.label}{ this.props.required ? '*' : '' }</TruncateText> : null }
        <input type={ this.props.type || 'text' } className={ this.props.inputClass || '' } value={ this.props.value } onChange={ this.props.onChange }
          placeholder={ this.props.placeholder } readOnly={ this.props.readOnly } required={ this.props.required } />
        <div className={ 'text-input-err ' + (this.props.error ? 'error-showing' : '') }>
          <span className="text-input-err-caret"></span>
          <span className="text-input-err-msg"><span></span>{ this.props.error }</span>
        </div>
      </div>
    );
  }
}
