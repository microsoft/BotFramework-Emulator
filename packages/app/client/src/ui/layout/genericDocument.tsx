import * as React from 'react';
import { css } from 'glamor';

const CSS = css({
  boxSizing: 'border-box',
  padding: '32px',
  height: '100%',
  width: '100%',
  minWidth: '480px',
  overflowX: 'hidden',
  overflowY: 'auto'
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
        { this.props.children }
      </div>
    );
  }
}
