import * as React from 'react';
import { css } from 'glamor';

const CSS = css({
  boxSizing: 'border-box',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  width: '100%',
  minWidth: '480px',
  overflowX: 'hidden',
  overflowY: 'auto',

  '& > .generic-doc-content': {
    width: '90%',
    maxWidth: '1200px'
  }
});

interface IGenericDocumentProps {
  // Allows glamor style objects to be passed in (ex. <GenericDocument style={ CSS } />)
  // NOTE: Do not use spread operator!!!
  style?: any;
}

export default class GenericDocument extends React.Component<IGenericDocumentProps, {}> {
  constructor(props, context) {
    super(props, context);
  }

  render(): JSX.Element {
    return (
      <div className="generic-doc" { ...CSS } { ...this.props.style }>
        <div className="generic-doc-content">
          { this.props.children }
        </div>
      </div>
    );
  }
}
