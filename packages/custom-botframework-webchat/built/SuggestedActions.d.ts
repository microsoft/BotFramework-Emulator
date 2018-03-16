/// <reference types="react" />
import * as React from 'react';
import { Message } from 'botframework-directlinejs';
import { IDoCardAction } from './Chat';
export interface SuggestedActionsProps {
    activityWithSuggestedActions: Message;
    takeSuggestedAction: (message: Message) => any;
    doCardAction: IDoCardAction;
}
export declare const SuggestedActions: React.ComponentClass<any>;
