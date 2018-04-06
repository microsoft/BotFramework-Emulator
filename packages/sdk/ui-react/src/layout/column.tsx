import * as React from 'react';
import { css } from 'glamor';

export enum ColumnAlignment {
  Left,
  Center,
  Right
}

export enum ColumnJustification {
  Top,
  Center,
  Bottom
}

const BASE_CSS = css({
  boxSizing: 'border-box',
  display: 'flex',
  flexFlow: 'column nowrap',
  maxWidth: '100%',
  width: '100%',
  overflow: 'hidden'
});

interface IColumnProps {
  align?: ColumnAlignment;
  className?: string;
  justify?: ColumnJustification;
}

export class Column extends React.Component<IColumnProps, {}> {
  constructor(props, context) {
    super(props, context);
  }

  render(): JSX.Element {
    const ALIGNMENT_CSS = css({
      alignItems: getColumnAlignment(this.props.align),
      justifyContent: getColumnJustification(this.props.justify)
    });
    const CSS = css(BASE_CSS, ALIGNMENT_CSS);

    return (
      <div className={ 'column-comp ' + (this.props.className || '') } { ...CSS }>
        { this.props.children }
      </div>
    );
  }
}

/** Converts a column alignment (horizontal axis) type to its flexbox style value */
function getColumnAlignment(a: ColumnAlignment): string {
  switch (a) {
    case ColumnAlignment.Center:
      return 'center';

    case ColumnAlignment.Right:
      return 'flex-end';

    case ColumnAlignment.Left:
    default:
      return 'flex-start';
  }
}

/** Converts a column justification (vertical axis) type to its flexbox style value */
function getColumnJustification(j: ColumnJustification): string {
  switch (j) {
    case ColumnJustification.Center:
      return 'center';

    case ColumnJustification.Bottom:
      return 'flex-end';

    case ColumnJustification.Top:
    default:
      return 'flex-start';
  }
}
