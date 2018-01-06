import React from 'react';

import * as constants from '../../../constants';
import BotTab from './botTab';
import CardTab from './cardTab';
import ConversationTab from './conversationTab';
import TestBedTab from './testBedTab';

export default props =>
    props.document.contentType === constants.ContentType_BotChat ?
        <BotTab document={ props.document } />
    : props.document.contentType === constants.ContentType_Card ?
        <CardTab document={ props.document } />
    : props.document.contentType === constants.ContentType_Converation ?
        <ConversationTab document={ props.document } />
    : props.document.contentType === constants.ContentType_TestBed ?
        <TestBedTab />
    : false
