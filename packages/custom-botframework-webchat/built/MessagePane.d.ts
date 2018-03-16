/// <reference types="react" />
import * as React from 'react';
import { IDoCardAction } from './Chat';
export interface MessagePaneProps {
    children: React.ReactNode;
    doCardAction: IDoCardAction;
}
export declare const MessagePane: React.ComponentClass<any>;
