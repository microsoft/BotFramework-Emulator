import React, { Component } from 'react';
import { css } from 'glamor';

const SIMPLE_CSS = css({
    color: 'white',
    overflowY: 'auto',
    height: '100%'
});

class Simple extends Component {

  render() {
    return (
        <div { ...SIMPLE_CSS }>
            Simple!!
        </div>
    )
  }
}

export default Simple;