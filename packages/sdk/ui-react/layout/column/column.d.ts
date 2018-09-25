import * as React from 'react';
export declare enum ColumnAlignment {
    Left = 0,
    Center = 1,
    Right = 2
}
export declare enum ColumnJustification {
    Top = 0,
    Center = 1,
    Bottom = 2
}
export interface ColumnProps {
    align?: ColumnAlignment;
    className?: string;
    justify?: ColumnJustification;
}
export declare class Column extends React.Component<ColumnProps, {}> {
    render(): JSX.Element;
    /** Converts a column alignment (horizontal axis) type to its flexbox style value */
    private getColumnAlignment;
    /** Converts a column justification (vertical axis) type to its flexbox style value */
    private getColumnJustification;
}
