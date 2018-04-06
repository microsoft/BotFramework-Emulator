import * as React from 'react';
import { css } from 'glamor';

export enum RowJustification {
  Left,
  Center,
  Right
}

export enum RowAlignment {
  Top,
  Center,
  Bottom
}

const BASE_CSS = css({
  boxSizing: 'border-box',
  display: 'flex',
  flexFlow: 'row nowrap',
  flexShrink: 0,
  overflow: 'hidden',
  width: '100%'
});

interface IRowProps {
  align?: RowAlignment;
  className?: string;
  justify?: RowJustification;
}

export class Row extends React.Component<IRowProps, {}> {
  constructor(props, context) {
    super(props, context);
  }

  render(): JSX.Element {
    const ALIGNMENT_CSS = css({
      alignItems: getRowAlignment(this.props.align),
      justifyContent: getRowJustification(this.props.justify)
    });
    const CSS = css(BASE_CSS, ALIGNMENT_CSS);

    return (
      <div className={ 'row-comp ' + (this.props.className || '') } { ...CSS }>
        { this.props.children }
      </div>
    );
  }
}

/** Converts a row alignment (vertical axis) type to its flexbox style value */
function getRowAlignment(a: RowAlignment): string {
  switch (a) {
    case RowAlignment.Center:
      return 'center';

    case RowAlignment.Bottom:
      return 'flex-end';

    case RowAlignment.Top:
    default:
      return 'flex-start';
  }
}

/** Converts a row justification (horizontal axis) type to its flexbox style value */
function getRowJustification(j: RowJustification): string {
  switch (j) {
    case RowJustification.Center:
      return 'center';

    case RowJustification.Right:
      return 'flex-end';

    case RowJustification.Left:
    default:
      return 'flex-start';
  }
}
