import * as React from 'react';
import { SplitterOrientation } from '.';
export interface SplitterPaneProps {
    orientation?: SplitterOrientation;
    size?: number;
}
export declare class SplitterPane extends React.Component<SplitterPaneProps, {}> {
    render(): JSX.Element;
}
