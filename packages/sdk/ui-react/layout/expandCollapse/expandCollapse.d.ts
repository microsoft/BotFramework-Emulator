import * as React from 'react';
export interface ExpandCollapseProps {
    expanded?: boolean;
    title?: string;
    className?: string;
    ariaLabel?: string;
}
export interface ExpandCollapseState {
    expanded: boolean;
}
export declare class ExpandCollapse extends React.Component<ExpandCollapseProps, ExpandCollapseState> {
    constructor(props: ExpandCollapseProps);
    render(): JSX.Element;
    private readonly toggleIcon;
    componentWillReceiveProps(newProps: ExpandCollapseProps): void;
    private onToggleExpandedButtonClick;
    private onHeaderKeyPress;
}
export declare const ExpandCollapseControls: (props: any) => any;
export declare const ExpandCollapseContent: (props: any) => any;
