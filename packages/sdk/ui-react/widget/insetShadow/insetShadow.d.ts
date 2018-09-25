import * as React from 'react';
export declare type InsetShadowOrientation = 'top' | 'bottom' | 'left' | 'right';
export interface Props {
    orientation: InsetShadowOrientation;
}
export declare class InsetShadow extends React.Component<Props> {
    render(): JSX.Element;
}
