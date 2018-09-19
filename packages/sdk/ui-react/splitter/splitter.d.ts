import * as React from 'react';
import { SplitterPane } from './pane';
export declare type SplitterOrientation = 'horizontal' | 'vertical';
export interface SplitterProps {
    children?: any;
    initialSizes?: {
        [paneIndex: number]: number | string;
    } | (() => {
        [paneIndex: number]: number | string;
    });
    minSizes?: {
        [paneIndex: number]: number;
    };
    onSizeChange?: (sizes: any[]) => any;
    orientation?: SplitterOrientation;
    primaryPaneIndex?: number;
}
export interface SplitterState {
    paneSizes?: number[];
    resizing?: boolean;
}
export declare class Splitter extends React.Component<SplitterProps, SplitterState> {
    static defaultProps: SplitterProps;
    private activeSplitter;
    private splitters;
    private splitNum;
    private panes;
    private paneNum;
    private containerSize;
    private containerRef;
    constructor(props: SplitterProps, context: SplitterState);
    componentWillMount(): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentWillReceiveProps(nextProps: SplitterProps): void;
    calculateInitialPaneSizes(): void;
    getContainerSize(): number;
    checkForContainerResize(): void;
    calculateSecondaryPaneSizes(oldContainerSize: number, newContainerSize: number): void;
    saveContainerRef(element: HTMLElement): void;
    saveSplitterRef(element: HTMLElement, index: number): void;
    savePaneRef(element: SplitterPane, index: number): void;
    onGrabSplitter(e: any, splitterIndex: number): void;
    onMouseMove(e: any): void;
    calculatePaneSizes(splitterIndex: number, e: any): void;
    onMouseUp(): void;
    render(): JSX.Element;
}
