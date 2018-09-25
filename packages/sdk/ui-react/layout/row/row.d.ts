import * as React from 'react';
export declare enum RowJustification {
    Left = 0,
    Center = 1,
    Right = 2
}
export declare enum RowAlignment {
    Top = 0,
    Center = 1,
    Bottom = 2
}
export interface RowProps {
    align?: RowAlignment;
    className?: string;
    justify?: RowJustification;
}
export declare class Row extends React.Component<RowProps, {}> {
    render(): JSX.Element;
    /** Converts a row alignment (vertical axis) type to its flexbox style value */
    private getRowAlignment;
    /** Converts a row justification (horizontal axis) type to its flexbox style value */
    private getRowJustification;
}
